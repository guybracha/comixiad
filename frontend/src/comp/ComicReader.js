import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';

const ComicReader = () => {
    const {id} = useParams();
    const [comic, setComic] = useState(null);

    useEffect(() => {
        axios.get(`/api/comics/${id}`)
        .then(res => setComic(res.data))
        .catch(err => console.error(err));
    }, [id]);

    if (!comic) return <p>Loading...</p>;

    return(
        <div className='container mt-4'>
            <h2>{comic.title}</h2>
            <div className="comic-pages">
                {comic.pages.map((page, index) => (
                    <img src={page} alt={`Page ${index + 1}`} key={index} className="img-fluid" />
                ))}
            </div>
        </div>
    );
};

export default ComicReader
