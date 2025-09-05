import {useEffect, useState} from 'react'
import {useRouteLoaderData} from 'react-router'
import API, {setDrawscapeBaseUrl} from '~/lib/drawscapeApi'
import type {RootLoader} from '~/root'
import {useArtboards} from '~/context/artboards'

type FetchState<T> = {
  loading: boolean
  error: string | null
  data: T | null
}

export default function DrawscapeTest() {
  const rootData = useRouteLoaderData<RootLoader>('root')
  const {schematic_id, setSchematicId} = useArtboards()
  const [state, setState] = useState<FetchState<any>>({
    loading: false,
    error: null,
    data: null,
  })

  const fetchSchematics = async () => {
    const baseUrl = rootData?.drawscapeApiUrl
    if (!baseUrl) {
      setState({loading: false, error: 'DRAWSCAPE_API_URL is not configured', data: null})
      return
    }

    setState((s) => ({...s, loading: true, error: null}))
    try {
      setDrawscapeBaseUrl(baseUrl)
      const result = await API.get('schematics', {
        limit: 1
      })
      // setSchematicId(result[0].id)
      setState({loading: false, error: null, data: result})
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState({loading: false, error: message, data: null})
    }
  }

  useEffect(() => {
    // Auto-fetch on mount for convenience
    fetchSchematics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{marginTop: 16, padding: 16, border: '1px solid #eee', borderRadius: 8}}>
      <h2 style={{fontSize: 18, fontWeight: 600}}>Client-side Drawscape test</h2>
      <p style={{margin: '8px 0'}}>Base URL: {rootData?.drawscapeApiUrl || 'Not set'}</p>
      <p style={{margin: '8px 0'}}>Schematic ID (from context): {schematic_id ?? 'None'}</p>
      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        <button
          onClick={fetchSchematics}
          disabled={state.loading}
          style={{
            background: '#111',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 6,
            cursor: state.loading ? 'not-allowed' : 'pointer',
          }}
        >
          {state.loading ? 'Loading…' : 'Fetch Schematics'}
        </button>
        <button
          onClick={() => setSchematicId('demo-123')}
          style={{
            background: '#0a7',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 6,
          }}
        >
          Set Demo ID
        </button>
        <button
          onClick={() => setSchematicId(null)}
          style={{
            background: '#777',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 6,
          }}
        >
          Clear
        </button>
        {state.error && <span style={{color: 'crimson'}}>Error: {state.error}</span>}
      </div>
      {state.data && (
        <pre style={{marginTop: 12, maxHeight: 300, overflow: 'auto', background: '#fafafa', padding: 12, borderRadius: 6}}>
          {JSON.stringify(state.data?.[0] ?? state.data, null, 2)}
        </pre>
      )}
    </div>
  )
}


