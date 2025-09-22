import {type MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'Reviews | Drawscape'}];
};

export default function ShopAllPage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Reviews</h1>
        {/* <p className="mt-4 text-gray-600">Browse featured categories below.</p> */}
        <section className="mt-10">
          <div className="jdgm-widget jdgm-all-reviews-widget"> <div className="jdgm-all-reviews__body"></div></div>
        </section>
      </div>
    </div>
  );
}
