import {type LoaderFunctionArgs, useLoaderData} from 'react-router';
import API from '~/lib/drawscapeApi';
import DrawscapeTest from '~/components/DrawscapeTest';

export async function loader({}: LoaderFunctionArgs) {
  try {
    // Test the API connection by fetching schematics
    let res = await API.get('schematics');
  
    return {
      status: 200,
      results: res
    };
  } catch (error) {
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


