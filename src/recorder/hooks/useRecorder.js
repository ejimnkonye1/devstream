/**
 * useRecorder — MediaRecorder hook
 *
 * Flow:
 *  1. User clicks "Record" → getDisplayMedia() prompts the OS screen picker.
 *  2. User selects the recorder window (or any screen) in the picker.
 *  3. MediaRecorder collects chunks at 1-second intervals.
 *  4. User clicks "Stop" (or closes the stream via the browser toolbar).
 *  5. Blob is assembled and a download is triggered automatically.
 *
 * Format priority: video/mp4 → video/webm;codecs=vp9 → video/webm
 * Chrome 130+ supports video/mp4 natively in MediaRecorder.
 */

import { useState, useRef, useCallback } from 'react'

function selectMimeType() {
  const candidates = [
    'video/mp4',
    'video/mp4;codecs=avc1',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm',
  ]
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return '' // Let the browser decide
}

export default function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState('')       // human-readable status string
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  // ── Start ──────────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setError(null)
    setStatus('Select the DevStream window in the screen picker…')

    let stream
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // Prefer the current tab/window for a smoother UX hint.
          displaySurface: 'window',
          width:     { ideal: 1920, max: 3840 },
          height:    { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30,   max: 60   },
        },
        audio: false,
        // Chrome-only: surface selection hint shown in the picker.
        selfBrowserSurface: 'include',
        preferCurrentTab: false,
      })
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        // User dismissed the picker — treat as a no-op.
        setStatus('')
      } else {
        setError(`Could not start capture: ${err.message}`)
        setStatus('')
      }
      return
    }

    streamRef.current = stream
    chunksRef.current = []

    const mimeType = selectMimeType()
    const options = mimeType ? { mimeType } : {}

    let recorder
    try {
      recorder = new MediaRecorder(stream, options)
    } catch (err) {
      setError(`MediaRecorder init failed: ${err.message}`)
      stream.getTracks().forEach((t) => t.stop())
      return
    }

    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.onstop = () => {
      const effectiveMime = recorder.mimeType || mimeType || 'video/webm'
      const blob = new Blob(chunksRef.current, { type: effectiveMime })
      const ext = effectiveMime.includes('mp4') ? 'mp4' : 'webm'

      // Trigger browser download
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `devstream-${Date.now()}.${ext}`
      anchor.click()

      // Clean up object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 10_000)

      setIsRecording(false)
      setStatus('')
    }

    recorder.onerror = (e) => {
      setError(`Recording error: ${e.error?.message ?? 'unknown'}`)
      stopRecording()
    }

    // Handle the user clicking "Stop sharing" in the browser toolbar.
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      if (recorder.state !== 'inactive') recorder.stop()
      setIsRecording(false)
      setStatus('')
    })

    // Collect data every second so onstop has chunks available.
    recorder.start(1000)

    setIsRecording(true)
    setStatus('Recording…')
  }, [])

  // ── Stop ───────────────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setStatus('Saving file…')
  }, [])

  return { isRecording, status, error, startRecording, stopRecording }
}
