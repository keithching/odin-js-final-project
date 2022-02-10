import { useNavigate } from 'react-router-dom';

const Username = (props) => {
    const { className, username } = props;

    let navigate = useNavigate();

    const navigateToPage = () => {
        navigate(`${username}/`);
    }

    return (
        <div className={className} onClick={navigateToPage}>
            {username || 'default'} 
        </div>
    );
};

export default Username;