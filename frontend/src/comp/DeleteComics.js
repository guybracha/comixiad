import axios from 'axios';
import { useUser } from '../context/UserContext';

const DeleteComic = ({ comicId }) => {
    const { user } = useUser();

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this comic?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/comics/${comicId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            alert('Comic deleted successfully!');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete comic. Please try again.');
        }
    };

    return (
        <button onClick={handleDelete} className="btn btn-danger">
            Delete Comic
        </button>
    );
};

export default DeleteComic;