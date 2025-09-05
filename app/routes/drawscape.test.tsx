import {type LoaderFunctionArgs, useLoaderData} from 'react-router';
import API, { setDrawscapeBaseUrl } from '~/lib/drawscapeApi';
import DrawscapeTest from '~/components/DrawscapeTest';

export async function loader({ context }: LoaderFunctionArgs) {
  
  console.log('context', context.env.DRAWSCAPE_API_URL);
  
  // console.log('loader', context.env);
  try {
    setDrawscapeBaseUrl(context.env.DRAWSCAPE_API_URL)
    // Hit a harmless endpoint or healthcheck; default to '/'  
    let res = await API.get('schematics');
    console.log('res', res);
  
    return {
      status: 200,
      results: res
    };
  } catch (error) {
    console.log(error)
    return {status: 500, message: (error as Error).message};
  }
}

export default function DrawscapeTestRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{padding: 16}}>
      <h1>Drawscape connectivity</h1>
      <p>Status: {data.status}</p>
      {JSON.stringify(data.results[0])}
      <DrawscapeTest />
    </div>
  );
}


