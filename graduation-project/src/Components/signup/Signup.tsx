import { useState, type ChangeEvent, type FormEvent, useCallback, useMemo } from 'react';
import { Card, Label, TextInput, Checkbox, Alert, Spinner } from 'flowbite-react';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { registerUser } from '../../services/auth';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const APP_ROUTES = {
  login: '/login',
  home: '/'
};

const validationSchema = yup.object({
  fullName: yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Full name can only contain letters and spaces'),
  email: yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/, 'Must contain lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Must contain uppercase letter')
    .matches(/^(?=.*\d)/, 'Must contain a number')
    .matches(/^(?=.*[@$!%*?&])/, 'Must contain special character (@$!%*?&)'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  agreeTerms: yup.boolean()
    .oneOf([true], 'You must agree to the terms')
});

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "", email: "", password: "", confirmPassword: "", agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    const strengthMap: Record<number, { score: number; label: string; color: string }> = {
      0: { score: 0, label: 'Very Weak', color: 'bg-red-500' },
      1: { score: 1, label: 'Weak', color: 'bg-orange-500' },
      2: { score: 2, label: 'Fair', color: 'bg-yellow-500' },
      3: { score: 3, label: 'Good', color: 'bg-blue-500' },
      4: { score: 4, label: 'Strong', color: 'bg-green-500' },
      5: { score: 5, label: 'Very Strong', color: 'bg-green-700' },
    };
    return strengthMap[Math.min(score, 5)] ?? strengthMap[0];
  }, [formData.password]);

  const validateField = useCallback(async (name: string, value: any) => {
    try {
      const fieldSchema = yup.reach(validationSchema, name) as yup.AnySchema;
      await fieldSchema.validate(value);
      setErrors(prev => ({ ...prev, [name]: '' }));
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors(prev => ({ ...prev, [name]: error.message }));
      }
      return false;
    }
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setSubmitError(null);
    
    if (touched[name]) validateField(name, newValue);
  }, [touched, validateField]);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const currentValue = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, currentValue);
  }, [validateField]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      
      const response = await registerUser({
        displayName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (response.succeeded) {
        // Show success message and redirect to confirmation page
        alert(response.message || "Registration successful! Please check your email to confirm your account.");
        navigate('/confirm-email', { state: { email: formData.email } });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getError = (field: string) => touched[field] && errors[field];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-900">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">Join us to get started with amazing features</p>
        </div>

        {submitError && (
          <Alert color="failure" onDismiss={() => setSubmitError(null)}>
            <span className="font-medium">Error!</span> {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <TextInput
              id="fullName" name="fullName" icon={HiUser} placeholder="Enter your full name"
              value={formData.fullName} onChange={handleChange} onBlur={handleBlur}
              color={getError('fullName') ? 'failure' : 'gray'} disabled={isSubmitting}
            />
            {getError('fullName') && <p className="text-xs text-red-600 mt-1">{getError('fullName')}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <TextInput
              id="email" name="email" type="email" icon={HiMail} placeholder="name@example.com"
              value={formData.email} onChange={handleChange} onBlur={handleBlur}
              color={getError('email') ? 'failure' : 'gray'} disabled={isSubmitting}
            />
            {getError('email') && <p className="text-xs text-red-600 mt-1">{getError('email')}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <TextInput
                id="password" name="password" type={showPassword ? "text" : "password"}
                icon={HiLockClosed} placeholder="Create a strong password"
                value={formData.password} onChange={handleChange} onBlur={handleBlur}
                onFocus={() => setPasswordFocused(true)}
                color={getError('password') ? 'failure' : 'gray'} disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
              </button>
            </div>
            
            {formData.password && passwordFocused && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} transition-all`} 
                         style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium">{passwordStrength.label}</span>
                </div>
              </div>
            )}
            {getError('password') && <p className="text-xs text-red-600 mt-1">{getError('password')}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <TextInput
                id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                icon={HiLockClosed} placeholder="Confirm your password"
                value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                color={getError('confirmPassword') ? 'failure' : 'gray'} disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
              </button>
            </div>
            {getError('confirmPassword') && <p className="text-xs text-red-600 mt-1">{getError('confirmPassword')}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <Checkbox id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms}
                      onChange={handleChange} onBlur={handleBlur} disabled={isSubmitting} />
            <Label htmlFor="agreeTerms" className="text-sm">
              I agree to the <a href="#" className="text-green-600 hover:underline">Terms and Conditions</a> and{' '}
              <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
            </Label>
          </div>
          {getError('agreeTerms') && <p className="text-xs text-red-600">{getError('agreeTerms')}</p>}

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting}
            className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light /> Creating Account...
              </span>
            ) : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account? <Link to={APP_ROUTES.login} className="text-green-600 hover:underline">Log in</Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            Continue as a guest? <Link to={APP_ROUTES.home} className="text-green-600 hover:underline">Yes</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}