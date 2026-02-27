// Required for static export
export function generateStaticParams() {
  return [{ propertyId: 'dummy' }];
}

import BookingContent from './BookingContent';

// 预订页面 - 服务器组件
export default function BookingPage() {
  return <BookingContent />;
}
