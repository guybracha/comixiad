import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ComicList = () => {
    const [comic, setComics] = useState([]);

    useEffect(() => {
        axios.get('/api/comics')
        .then(res => setComics(res.data))
        .catch(err => console.error(err));
    }, []);

    return(
        <div className="container mt-4">
            <h2>Comics</h2>
            <div className="row">
                {comic.map(comic => (
                    <div className="col-md-4" key={comic._id}>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{comic.title}</h5>
                                <p className="card-text">{comic.description}</p>
                                <p className="card-text">{comic.language}</p>
                                <p className="card-text">{comic.genre}</p>
                                <Link to={`/comics/${comic._id}`} className="btn btn-primary">Read</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ComicList
