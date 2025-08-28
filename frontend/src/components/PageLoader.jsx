import React from 'react';

const PageLoader = () => {
    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
            }}
            role="status"
            aria-label="Loading"
        >
            <div className="spinner-border text-primary" role="status" aria-hidden="true" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default PageLoader;
