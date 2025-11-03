import { type ActionFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, useActionData, type MetaFunction } from 'react-router';
import { RequestDesignForm } from '~/components/RequestDesignForm';
import { sendPostmarkEmail } from '~/lib/postmark';

export const meta: MetaFunction = () => {
  return [
    { title: 'Drawscape | Request a Design' },
    { name: 'description', content: 'Submit a custom design request for airports, aircraft, sailboats, and more.' },
    { rel: 'canonical', href: '/request-a-design' },
  ];
};

export async function loader() {
  return {
    schematicTitle: null,
  };
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    // Parse form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const category = formData.get('category') as string;
    const joinNewsletter = formData.get('joinNewsletter') === 'true';

    // Category-specific fields
    const airportCode = formData.get('airportCode') as string;
    const aircraftType = formData.get('aircraftType') as string;
    const helicopterType = formData.get('helicopterType') as string;
    const aerospaceName = formData.get('aerospaceName') as string;
    const sailboatName = formData.get('sailboatName') as string;
    const shipName = formData.get('shipName') as string;
    const cameraModel = formData.get('cameraModel') as string;
    const carMake = formData.get('carMake') as string;
    const carModel = formData.get('carModel') as string;
    const carYear = formData.get('carYear') as string;
    const truckMake = formData.get('truckMake') as string;
    const truckModel = formData.get('truckModel') as string;
    const truckYear = formData.get('truckYear') as string;
    const patentNumber = formData.get('patentNumber') as string;
    const engineType = formData.get('engineType') as string;
    const requestText = formData.get('request') as string;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !category?.trim()) {
      return {
        success: false,
        error: 'Please fill in all required fields.',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address.',
      };
    }

    // Build category-specific details string
    let categoryDetails = '';
    switch (category) {
      case 'aircraft':
        categoryDetails = aircraftType || '';
        break;
      case 'helicopters':
        categoryDetails = helicopterType || '';
        break;
      case 'aerospace':
        categoryDetails = aerospaceName || '';
        break;
      case 'airport-diagrams':
        categoryDetails = airportCode || '';
        break;
      case 'sailboats':
        categoryDetails = sailboatName || '';
        break;
      case 'ships':
        categoryDetails = shipName || '';
        break;
      case 'cameras':
        categoryDetails = cameraModel || '';
        break;
      case 'cars':
        categoryDetails = carMake && carModel && carYear
          ? `${carYear} ${carMake} ${carModel}`
          : '';
        break;
      case 'trucks':
        categoryDetails = truckMake && truckModel && truckYear
          ? `${truckYear} ${truckMake} ${truckModel}`
          : '';
        break;
      case 'patent-art':
        categoryDetails = patentNumber || '';
        break;
      case 'engines':
        categoryDetails = engineType || '';
        break;
      case 'other':
        categoryDetails = requestText || '';
        break;
    }

    // Send email to team@drawscape.io using Postmark
    if (context.env.POSTMARK_API_KEY) {
      try {
        const emailHtml = `
          <h2>New Design Request</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Category:</strong> ${category}</p>
          ${categoryDetails ? `<p><strong>Details:</strong> ${categoryDetails}</p>` : ''}
          ${requestText && category !== 'other' ? `<p><strong>Additional Details:</strong> ${requestText}</p>` : ''}
          <p><strong>Newsletter Opt-in:</strong> ${joinNewsletter ? 'Yes' : 'No'}</p>
        `;

        const emailText = `
New Design Request

From: ${name} (${email})
Category: ${category}
${categoryDetails ? `Details: ${categoryDetails}` : ''}
${requestText && category !== 'other' ? `Additional Details: ${requestText}` : ''}
Newsletter Opt-in: ${joinNewsletter ? 'Yes' : 'No'}
        `;

        await sendPostmarkEmail(context.env.POSTMARK_API_KEY, {
          to: 'team@drawscape.io',
          subject: 'Design Request',
          htmlBody: emailHtml,
          textBody: emailText,
          replyTo: email,
        });

        console.log('Design request email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the form submission if email fails
      }
    } else {
      console.warn('POSTMARK_API_KEY not configured - email not sent');
    }

    // Return success
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error processing design request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit request. Please try again.',
    };
  }
}

export default function RequestADesign() {
  const { schematicTitle } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <RequestDesignForm
      schematicTitle={schematicTitle || undefined}
      actionData={actionData}
    />
  );
}
