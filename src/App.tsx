import { Presentation } from './components/Presentation';
import { slides } from './slides';
import './design-system/index.css';
import './styles/slide-layouts.css';

export default function App() {
  return <Presentation slides={slides} />;
}
