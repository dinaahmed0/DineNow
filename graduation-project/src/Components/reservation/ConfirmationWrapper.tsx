import { useLocation } from 'react-router-dom';
import ConfirmationPage from './ConfirmationPage';

export default function ConfirmationWrapper() {
  const location = useLocation();
  const reservationData = location.state?.reservationData || {
    formData: {},
    restaurantData: {},
    orderedFood: [],
    paymentCompleted: false
  };

  return <ConfirmationPage reservationData={reservationData} />;
}
