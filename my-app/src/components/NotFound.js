import Footer from './Footer';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h3>Sorry, this page isn't available.</h3>
                <p>The link you followed may be broken, or the page may have been removed.</p>
            </div>
            <Footer />
        </div>
    );
};

export default NotFound;