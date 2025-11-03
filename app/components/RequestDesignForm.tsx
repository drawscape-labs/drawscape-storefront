/**
 * RequestDesignForm
 *
 * A standalone form component for submitting a design request.
 * Used on the /request-a-design route.
 *
 * Collects: name, email address, category, and category-specific details.
 * Submits via React Router form action to server-side handler.
 *
 * Props:
 * - schematicTitle?: string - Optional pre-populated design request from query param
 * - actionData?: object - Form submission result from server action
 */
import React, { useState } from 'react';
import { Form, useNavigation } from 'react-router';
import { Input } from '~/ui/input';
import { Textarea } from '~/ui/textarea';
import { Button } from '~/ui/button';
import { Heading } from '~/ui/heading';
import { Fieldset, Field, Label, Description } from '~/ui/fieldset';
import { CheckboxField, Checkbox } from '~/ui/checkbox';
import { Select } from '~/ui/select';
import { subscribeToNewsletterClient } from '~/lib/klaviyo';

// Declare Klaviyo and Simple Analytics globals for TypeScript
declare global {
  interface Window {
    klaviyo?: {
      identify: (properties: Record<string, any>) => void;
      track: (eventName: string, properties?: Record<string, any>) => void;
      push: (args: any[]) => void;
      isIdentified: () => boolean;
    };
    sa_event?: (eventName: string, metadata?: Record<string, any> | (() => void)) => void;
  }
}

interface RequestDesignFormProps {
  schematicTitle?: string;
  actionData?: {
    success?: boolean;
    error?: string;
  };
}

// Category options for the design request
const CATEGORIES = [
  { value: '', label: 'Select a category...' },
  { value: 'aerospace', label: 'Aerospace' },
  { value: 'aircraft', label: 'Aircraft' },
  { value: 'airport-diagrams', label: 'Airport Diagrams' },
  { value: 'cameras', label: 'Cameras' },
  { value: 'cars', label: 'Cars' },
  { value: 'engines', label: 'Engines' },
  { value: 'helicopters', label: 'Helicopters' },
  { value: 'patent-art', label: 'Patent Art' },
  { value: 'sailboats', label: 'Sailboats' },
  { value: 'ships', label: 'Ships' },
  { value: 'trucks', label: 'Trucks' },
  { value: '---', label: '──────────', disabled: true }, // Spacer
  { value: 'other', label: 'Other' },
];

export const RequestDesignForm = ({ schematicTitle, actionData }: RequestDesignFormProps) => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [request, setRequest] = useState(schematicTitle || '');
  const [joinNewsletter, setJoinNewsletter] = useState(true);

  // Category-specific fields
  const [airportCode, setAirportCode] = useState('');
  const [aircraftType, setAircraftType] = useState('');
  const [helicopterType, setHelicopterType] = useState('');
  const [aerospaceName, setAerospaceName] = useState('');
  const [sailboatName, setSailboatName] = useState('');
  const [shipName, setShipName] = useState('');
  const [cameraModel, setCameraModel] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [truckMake, setTruckMake] = useState('');
  const [truckModel, setTruckModel] = useState('');
  const [truckYear, setTruckYear] = useState('');
  const [patentNumber, setPatentNumber] = useState('');
  const [engineType, setEngineType] = useState('');

  // Image upload state
  const [images, setImages] = useState<Array<{name: string; base64: string; size: number}>>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  // Store submitted name and email to preserve on next request
  React.useEffect(() => {
    if (actionData?.success) {
      // Store name and email in localStorage when form is successfully submitted
      if (name) localStorage.setItem('designRequest_name', name);
      if (email) localStorage.setItem('designRequest_email', email);

      // Klaviyo integration - identify user and track event
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (window.klaviyo) {
        window.klaviyo.identify({
          email: email,
          first_name: firstName,
          last_name: lastName,
        });

        // Get the category-specific details for the event
        let requestDetails = '';
        switch (category) {
          case 'aircraft':
            requestDetails = aircraftType;
            break;
          case 'helicopters':
            requestDetails = helicopterType;
            break;
          case 'aerospace':
            requestDetails = aerospaceName;
            break;
          case 'airport-diagrams':
            requestDetails = airportCode;
            break;
          case 'sailboats':
            requestDetails = sailboatName;
            break;
          case 'ships':
            requestDetails = shipName;
            break;
          case 'cameras':
            requestDetails = cameraModel;
            break;
          case 'cars':
            requestDetails = `${carYear} ${carMake} ${carModel}`;
            break;
          case 'trucks':
            requestDetails = `${truckYear} ${truckMake} ${truckModel}`;
            break;
          case 'patent-art':
            requestDetails = patentNumber;
            break;
          case 'engines':
            requestDetails = engineType;
            break;
          case 'other':
            requestDetails = request;
            break;
        }

        window.klaviyo.track('Requested Design', {
          request_category: category,
          request_details: requestDetails,
        });

        // Simple Analytics event tracking
        if (window.sa_event) {
          window.sa_event('requested_design');
        }
      }

      // Subscribe to newsletter if user opted in
      if (joinNewsletter) {
        subscribeToNewsletterClient({
          email: email,
          firstName,
          lastName,
          properties: {
            source: 'Design Request Form',
          },
        }).catch((error) => {
          // Log error but don't fail the form submission
          console.error('Newsletter subscription failed:', error);
        });
      }
    }
  }, [
    actionData?.success,
    name,
    email,
    category,
    joinNewsletter,
    aircraftType,
    helicopterType,
    aerospaceName,
    airportCode,
    sailboatName,
    shipName,
    cameraModel,
    carMake,
    carModel,
    carYear,
    truckMake,
    truckModel,
    truckYear,
    patentNumber,
    engineType,
    request,
  ]);

  // Load saved name and email on component mount
  React.useEffect(() => {
    const savedName = localStorage.getItem('designRequest_name');
    const savedEmail = localStorage.getItem('designRequest_email');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Determine if form is valid (all required fields filled)
  const getCategoryFieldValue = () => {
    switch (category) {
      case 'aircraft': return aircraftType.trim();
      case 'helicopters': return helicopterType.trim();
      case 'aerospace': return aerospaceName.trim();
      case 'airport-diagrams': return airportCode.trim();
      case 'sailboats': return sailboatName.trim();
      case 'ships': return shipName.trim();
      case 'cameras': return cameraModel.trim();
      case 'cars': return carMake.trim() && carModel.trim() && carYear.trim() ? 'valid' : '';
      case 'trucks': return truckMake.trim() && truckModel.trim() && truckYear.trim() ? 'valid' : '';
      case 'patent-art': return patentNumber.trim();
      case 'engines': return engineType.trim();
      case 'other': return request.trim();
      default: return '';
    }
  };

  const isFormValid = name.trim() !== '' &&
                      email.trim() !== '' &&
                      category !== '' &&
                      getCategoryFieldValue() !== '';

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError(null);

    // Convert FileList to Array
    const fileArray = Array.from(files);

    // Validate total size (8MB limit) including existing images
    const existingSize = images.reduce((sum, img) => sum + img.size, 0);
    const newFilesSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    const totalSize = existingSize + newFilesSize;
    const maxSize = 8 * 1024 * 1024; // 8MB in bytes

    if (totalSize > maxSize) {
      setImageError(`Total file size exceeds 8MB limit. Current total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      e.target.value = ''; // Clear input
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setImageError('Only JPEG, PNG, GIF, WebP, and SVG images are allowed');
      e.target.value = ''; // Clear input
      return;
    }

    // Convert to base64
    try {
      const imagePromises = fileArray.map(file => {
        return new Promise<{name: string; base64: string; size: number}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve({
              name: file.name,
              base64: base64,
              size: file.size,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const convertedImages = await Promise.all(imagePromises);

      // Add new images to existing ones instead of replacing
      setImages(prevImages => [...prevImages, ...convertedImages]);

      // Clear the file input so the same file can be added again if needed
      e.target.value = '';
    } catch (error) {
      setImageError('Failed to process images. Please try again.');
      e.target.value = ''; // Clear input
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Render category-specific fields
  const renderCategoryFields = () => {
    switch (category) {
      case 'aircraft':
        return (
          <Field className="mb-6">
            <Label htmlFor="aircraftType" className="block text-sm font-medium text-gray-700 mb-2">
              Aircraft Model
            </Label>
            <Input
              id="aircraftType"
              name="aircraftType"
              type="text"
              value={aircraftType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAircraftType(e.target.value)}
              placeholder="e.g., Cessna 172, Boeing 737, etc."
              className="w-full"
            />
          </Field>
        );

      case 'helicopters':
        return (
          <Field className="mb-6">
            <Label htmlFor="helicopterType" className="block text-sm font-medium text-gray-700 mb-2">
              Helicopter Model
            </Label>
            <Input
              id="helicopterType"
              name="helicopterType"
              type="text"
              value={helicopterType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHelicopterType(e.target.value)}
              placeholder="e.g., Bell 206, Robinson R44, Sikorsky S-76"
              className="w-full"
            />
          </Field>
        );

      case 'aerospace':
        return (
          <Field className="mb-6">
            <Label htmlFor="aerospaceName" className="block text-sm font-medium text-gray-700 mb-2">
              Aerospace Vehicle
            </Label>
            <Input
              id="aerospaceName"
              name="aerospaceName"
              type="text"
              value={aerospaceName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAerospaceName(e.target.value)}
              placeholder="e.g., Space Shuttle, USS Enterprise, SpaceX Starship"
              className="w-full"
            />
          </Field>
        );

      case 'airport-diagrams':
        return (
          <Field className="mb-6">
            <Label htmlFor="airportCode" className="block text-sm font-medium text-gray-700 mb-2">
              Airport Code or Name
            </Label>
            <Input
              id="airportCode"
              name="airportCode"
              type="text"
              value={airportCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAirportCode(e.target.value)}
              placeholder="e.g., KJFK, JFK, or John F. Kennedy International Airport"
              className="w-full"
            />
          </Field>
        );

      case 'sailboats':
        return (
          <Field className="mb-6">
            <Label htmlFor="sailboatName" className="block text-sm font-medium text-gray-700 mb-2">
              Sailboat Type
            </Label>
            <Input
              id="sailboatName"
              name="sailboatName"
              type="text"
              value={sailboatName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSailboatName(e.target.value)}
              placeholder="e.g., J/24, Catalina 30, Beneteau Oceanis 40"
              className="w-full"
            />
          </Field>
        );

      case 'ships':
        return (
          <Field className="mb-6">
            <Label htmlFor="shipName" className="block text-sm font-medium text-gray-700 mb-2">
              Ship Name or Type
            </Label>
            <Input
              id="shipName"
              name="shipName"
              type="text"
              value={shipName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShipName(e.target.value)}
              placeholder="e.g., USS Missouri, HMS Victory, USS Nimitz"
              className="w-full"
            />
          </Field>
        );

      case 'cameras':
        return (
          <Field className="mb-6">
            <Label htmlFor="cameraModel" className="block text-sm font-medium text-gray-700 mb-2">
              Camera Model
            </Label>
            <Input
              id="cameraModel"
              name="cameraModel"
              type="text"
              value={cameraModel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCameraModel(e.target.value)}
              placeholder="e.g., Nikon D850, Canon EOS R5, Leica M10"
              className="w-full"
            />
          </Field>
        );

      case 'cars':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Field>
                <Label htmlFor="carMake" className="block text-sm font-medium text-gray-700 mb-2">
                  Make
                </Label>
                <Input
                  id="carMake"
                  name="carMake"
                  type="text"
                  value={carMake}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCarMake(e.target.value)}
                  placeholder="e.g., Porsche"
                  className="w-full"
                />
              </Field>

              <Field>
                <Label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </Label>
                <Input
                  id="carModel"
                  name="carModel"
                  type="text"
                  value={carModel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCarModel(e.target.value)}
                  placeholder="e.g., 911"
                  className="w-full"
                />
              </Field>

              <Field>
                <Label htmlFor="carYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </Label>
                <Input
                  id="carYear"
                  name="carYear"
                  type="text"
                  value={carYear}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCarYear(e.target.value)}
                  placeholder="e.g., 2023"
                  className="w-full"
                />
              </Field>
            </div>
          </>
        );

      case 'trucks':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Field>
                <Label htmlFor="truckMake" className="block text-sm font-medium text-gray-700 mb-2">
                  Make
                </Label>
                <Input
                  id="truckMake"
                  name="truckMake"
                  type="text"
                  value={truckMake}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTruckMake(e.target.value)}
                  placeholder="e.g., Ford"
                  className="w-full"
                />
              </Field>

              <Field>
                <Label htmlFor="truckModel" className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </Label>
                <Input
                  id="truckModel"
                  name="truckModel"
                  type="text"
                  value={truckModel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTruckModel(e.target.value)}
                  placeholder="e.g., F-150"
                  className="w-full"
                />
              </Field>

              <Field>
                <Label htmlFor="truckYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </Label>
                <Input
                  id="truckYear"
                  name="truckYear"
                  type="text"
                  value={truckYear}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTruckYear(e.target.value)}
                  placeholder="e.g., 2023"
                  className="w-full"
                />
              </Field>
            </div>
          </>
        );

      case 'patent-art':
        return (
          <Field className="mb-6">
            <Label htmlFor="patentNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Patents URL
            </Label>
            <Input
              id="patentNumber"
              name="patentNumber"
              type="text"
              value={patentNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatentNumber(e.target.value)}
              placeholder="https://patents.google.com/patent/US20230200943A1/en"
              className="w-full"
            />
          </Field>
        );

      case 'engines':
        return (
          <Field className="mb-6">
            <Label htmlFor="engineType" className="block text-sm font-medium text-gray-700 mb-2">
              Engine Type
            </Label>
            <Input
              id="engineType"
              name="engineType"
              type="text"
              value={engineType}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEngineType(e.target.value)}
              placeholder="e.g., V8, Radial, Jet Engine"
              className="w-full"
            />
            <Description className="mt-2">
              Specify the type of engine or specific model
            </Description>
          </Field>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {!actionData?.success && (
        <>
          <Heading level={1} className="mb-4 text-3xl sm:text-4xl font-bold">
            Request a Design
          </Heading>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Curious if we can draw your thing? You are in the right spot. Use the form multiple times for each request.
          </p>
        </>
      )}

      {actionData?.success ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            Thank You!
          </h2>
          <p className="text-lg text-gray-700 text-center mb-8">
            We've received your design request and will review it shortly.
          </p>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold mr-3">1</span>
                <span>We'll review your request</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold mr-3">2</span>
                <span>If we can find your design, we'll send you some example images</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold mr-3">3</span>
                <span>If you like the examples, you can make a purchase via our website</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold mr-3">4</span>
                <span>We'll then send you a link to the full design to customize the colors, text, and layout</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              href="/request-a-design"
              color="indigo"
              className="px-8 py-3 text-base font-semibold"
            >
              Submit Another Request
            </Button>
            <Button
              href="/contact"
              outline={true}
              className="px-8 py-3 text-base font-semibold"
            >
              Contact Us
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-center text-sm sm:text-base">
                {actionData.error}
              </p>
            </div>
          )}

          <Form method="post">
            <Fieldset>
              {/* Inline Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="w-full"
                  />
                </Field>

                <Field>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    className="w-full"
                  />
                </Field>
              </div>

              {/* Category Select */}
              <Field className="mb-6">
                <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </Label>
                <Select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} disabled={'disabled' in cat ? cat.disabled : false}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
                <Description className="mt-2">
                  Select the type of design you're requesting
                </Description>
              </Field>

              {/* Category-Specific Fields - Only show when category is selected */}
              {category && (
                <>
                  {renderCategoryFields()}

                  {/* Design Request - Only show for "other" category */}
                  {category === 'other' && (
                    <Field className="mb-8">
                      <Label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-2">
                        Design Request Details
                      </Label>
                      <Textarea
                        id="request"
                        name="request"
                        value={request}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequest(e.target.value)}
                        required
                        rows={5}
                        placeholder="Describe your design request in detail..."
                        className="w-full resize-none"
                      />
                      <Description className="mt-2">
                        Please be as specific as possible. Include any special requirements, colors, or details you'd like.
                      </Description>
                    </Field>
                  )}

                  {/* Image Upload - Hide for airport-diagrams */}
                  {category !== 'airport-diagrams' && (
                  <Field className="mb-8">
                    <Label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Images (Optional)
                    </Label>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                      multiple
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <Description className="mt-2">
                      Please upload any 2D reference images you can find. This is EXTREMELY helpful for us. Blueprints, schematics, and line drawings all work. You can select multiple files at once or add more in batches. (JPEG, PNG, GIF, WebP, SVG). Max 8MB total.
                    </Description>

                    {/* Image Error */}
                    {imageError && (
                      <div className="mt-2 text-sm text-red-600">
                        {imageError}
                      </div>
                    )}

                    {/* Image Previews */}
                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.base64}
                              alt={image.name}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="mt-1 text-xs text-gray-500 truncate">
                              {image.name} ({(image.size / 1024).toFixed(0)}KB)
                            </div>
                            {/* Hidden input to submit base64 data */}
                            <input type="hidden" name={`image_${index}`} value={image.base64} />
                            <input type="hidden" name={`image_${index}_name`} value={image.name} />
                          </div>
                        ))}
                      </div>
                    )}
                  </Field>
                  )}

                  {/* Newsletter Signup */}
                  <CheckboxField className="mb-8">
                    <Checkbox
                      name="joinNewsletter"
                      color="indigo"
                      checked={joinNewsletter}
                      onChange={setJoinNewsletter}
                      value="true"
                    />
                    <Label>Stay Updated!</Label>
                    <Description>
                      Get notified about new designs and special offers.
                    </Description>
                  </CheckboxField>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      type="submit"
                      color="indigo"
                      className="px-8 py-3 text-lg font-semibold"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    <Button
                      type="button"
                      href="/"
                      outline={true}
                      className="px-8 py-3 text-lg font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </Fieldset>
          </Form>
        </div>
      )}

    </div>
  );
};

export default RequestDesignForm;
