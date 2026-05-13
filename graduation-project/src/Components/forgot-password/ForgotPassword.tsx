// import { Link } from 'react-router-dom';
// import { APP_ROUTES } from '../../constants/routes';

// export default function ForgotPassword() {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert('Password reset feature coming soon!');
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12  sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         {/* Header */}
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
//             Forgot your password?
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter your email and we'll send you a reset link
//           </p>
//         </div>

//         {/* Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 ">
//               Email address
//             </label>
//             <input
//               id="email"
//               name="email"
//               type="email"
//               required
//               className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
//               placeholder="name@example.com"
//             />
//           </div>

//           <div>
//             <button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-900 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer transition-colors"
//             >
//               Send Reset Link
//             </button>
//           </div>

//           {/* Back to Login */}
//           <div className="text-center">
//             <Link
//               to={APP_ROUTES.login}
//               className="text-sm text-green-600 dark:text-green-400 hover:text-green-500"
//             >
//               ← Back to Login
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import { Card, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiMail } from 'react-icons/hi';
import { forgotPassword } from '../../services/auth';

const StyledMailIcon = () => <HiMail className="text-green-900" />;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Basic validation
    if (!email) {
      setSubmitError("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    console.log("Password reset requested for:", email);
    
    try {
      const response = await forgotPassword({ email });
      console.log("Password reset successful:", response);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset link. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <HiMail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              We've sent a password reset link to:
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Check your email and click the reset link to create a new password.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-900 md:text-3xl">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {submitError && (
          <Alert color="failure" onDismiss={() => setSubmitError(null)}>
            <span className="font-medium">Error!</span> {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email">Email Address</Label>
            </div>
            <TextInput
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              value={email}
              icon={StyledMailIcon}
              placeholder="name@example.com"
              style={{
                fontSize: '0.75rem', 
                color: '#828283', 
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light />
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="text-center">
            <Link
              to={APP_ROUTES.login}
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-500"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}