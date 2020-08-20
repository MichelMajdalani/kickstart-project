
// TODO Abstract one button and have each of these button as specific instances of the general button
import { Button } from 'react-bootstrap';

function SuccessButton() {
    return (
        <Button variant="success" disabled>
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-check-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path fillRule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/>
            </svg>
            &nbsp;
            Success!
        </Button>
    );
}

function LoadingButton() {
    return (
        <Button variant="primary" disabled>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            &nbsp;Loading...
        </Button>
    );
}

export {
    SuccessButton, LoadingButton
}