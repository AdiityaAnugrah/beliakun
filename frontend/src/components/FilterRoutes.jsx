import useUserStore from "../../store/userStore";
import { Navigate } from "react-router-dom";
const FilterRoutes = ({ users, children }) => {
    const { role } = useUserStore();

    if (!role && !users) {
        return children;
    }
    if (!users && role) {
        return <Navigate to={role == "admin" ? "/admin" : "/"} />;
    }
    if (users.includes(role)) {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
};

export default FilterRoutes;
