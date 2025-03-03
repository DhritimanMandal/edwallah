import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe("pk_test_51QjIO6JBexQjWzyqw6q3Z1H5D5jpVmWRRIe8ZdhGw1OlpyhSV9cVlReqZ2AsrrsTDZu0znv2EY8n7Nq0JUyP6qsq00n3OIDzGA");


createRoot(document.getElementById('root')).render(
  <Elements stripe={stripePromise}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Elements>
)
