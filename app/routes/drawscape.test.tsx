import {type LoaderFunctionArgs, useLoaderData} from 'react-router';
import API from '~/lib/drawscapeApi';

export async function loader({}: LoaderFunctionArgs) {
  console.log('loader');
  try {
    // Hit a harmless endpoint or healthcheck; default to '/'  
    let res = await API.get('schematics');
  
    return {status: 200};
  } catch (error) {
    console.log(error)
    return {status: 500, message: (error as Error).message};
  }
}

export default function DrawscapeTest() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{padding: 16}}>
      <h1>Drawscape connectivity</h1>
      <p>Status: {data.status}</p>
      {data.message ? <pre>{data.message}</pre> : null}
    </div>
  );
}


