import SignUpPage from '../../../features/components/signup.tsx';
import { handleSignUp } from "./actions.tsx";

export default function SignUp() {
  

  return <SignUpPage handleSignUp={handleSignUp}></SignUpPage>;
}
