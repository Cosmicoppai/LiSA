export function ErrorMessage({ error }) {
    return (
        <span style={{ textAlign: 'center', marginTop: 100 }}>
            {error instanceof Error
                ? ` An error occurred: ${error.message}`
                : 'Something went wrong'}
        </span>
    );
}
