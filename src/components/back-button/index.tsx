import "./back-button.css";

export default function BackButton() {
    return (
        <div className="backBtn">
            <span className="line tLine"></span>
            <span className="line mLine"></span>
            <span className="label">Back</span>
            <span className="line bLine"></span>
        </div>
    );
};