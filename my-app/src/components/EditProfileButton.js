import { NavLink } from 'react-router-dom';

const EditProfileButton = (props) => {
    const { className } = props;

    return (
        <div className={className}>
            <NavLink to="/accounts/edit/">
                <i className="fas fa-cog"></i>
            </NavLink>
        </div>
    );
}

export default EditProfileButton;
