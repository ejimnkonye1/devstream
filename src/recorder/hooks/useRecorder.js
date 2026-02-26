/**
 * useRecorder — MediaRecorder hook
 *
 * Returns: { isRecording, elapsed, elapsedLabel, status, error, startRecording, stopRecording }
 *   elapsed      — integer seconds since recording started
 *   elapsedLabel — formatted "MM:SS" string for display
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
  return ''
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function useRecorder() {
  const [isRecording, setIsRecording]   = useState(false)
  const [elapsed, setElapsed]           = useState(0)
  const [status, setStatus]             = useState('')
  const [error, setError]               = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const streamRef        = useRef(null)
  const timerRef         = useRef(null)

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // ── Start ────────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setError(null)
    setStatus('Select the DevStream window in the screen picker…')

    let stream
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
          width:     { ideal: 1920, max: 3840 },
          height:    { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30,   max: 60   },
        },
        audio: false,
        selfBrowserSurface: 'include',
        preferCurrentTab: false,
      })
    } catch (err) {
      if (err.name === 'NotAllowedError') {
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
    const options  = mimeType ? { mimeType } : {}

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
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      clearTimer()
      const effectiveMime = recorder.mimeType || mimeType || 'video/webm'
      const blob = new Blob(chunksRef.current, { type: effectiveMime })
      const ext  = effectiveMime.includes('mp4') ? 'mp4' : 'webm'

      const url    = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href     = url
      anchor.download = `devstream-${Date.now()}.${ext}`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)

      setIsRecording(false)
      setElapsed(0)
      setStatus('')
    }

    recorder.onerror = (e) => {
      setError(`Recording error: ${e.error?.message ?? 'unknown'}`)
      stopRecording()
    }

    // User clicked "Stop sharing" in the browser toolbar.
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      if (recorder.state !== 'inactive') recorder.stop()
      clearTimer()
      setIsRecording(false)
      setElapsed(0)
      setStatus('')
    })

    recorder.start(1000)

    // Start elapsed timer.
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed((s) => s + 1)
    }, 1000)

    setIsRecording(true)
    setStatus('Recording…')
  }, [])

  // ── Stop ─────────────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    clearTimer()
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setStatus('Saving file…')
  }, [])

  return {
    isRecording,
    elapsed,
    elapsedLabel: formatTime(elapsed),
    status,
    error,
    startRecording,
    stopRecording,
  }
}
