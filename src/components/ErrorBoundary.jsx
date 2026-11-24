import { Component } from 'react';

/*
 * Class component example (Unit II – Overview of Class Components).
 * Error boundaries can only be written as class components. It shows a
 * friendly screen instead of a blank page if any child component crashes.
 * It also demonstrates this.state, this.props.children and bind().
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
    // bind() so that "this" refers to the component inside the handler
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error('Pennywise crashed:', error, info);
  }

  handleReset() {
    this.setState({ hasError: false, message: '' });
    window.location.assign('/');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <div className="card error-card">
            <h1>Something went wrong</h1>
            <p className="muted">{this.state.message}</p>
            <button className="btn btn-primary" onClick={this.handleReset}>
              Back to dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
