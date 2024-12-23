import React from 'react';
import monkey from '../img/monkey.jpg';

function Error() {
  return (
    <div className='container'>
      <h1>שגיאה</h1>
      <p>העמוד שרצית איננו קיים</p>
      <img className='img-fluid' src={monkey} alt='monkey' />
    </div>
  );
}

export default Error;
