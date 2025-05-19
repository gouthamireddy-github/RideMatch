import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const MyRides = (userId,role) => {
    const [rides, setRides] = useState([]);
    const [filterRides, setfilterRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const ridesPerPage = 10;
    const navigate = useNavigate();

    // Function to fetch rides from the server
    useEffect(() => {
        const fetchRides = async () => {
            try {
                const endpoint = role === 'driver' 
                ? `http://localhost:4000/ride/getRidesByDriverId/${userId}` 
                : `http://localhost:4000/ride/getRidesByRiderId/${userId}`;

                const response = await fetch(endpoint);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error (data.message||`Error: ${response.status}`);
                }

                setRides(data.rides);
                setfilterRides(data.rides);
                setLoading(false);

            }catch (error) {
                setError(error.message);
                setLoading(false);
            }
    }
    if (userId && role) {
        fetchRides();
        }
    }, [userId, role]);

    // Function to handle date filtering
    const handleDateFiltered = (e) => {
        const selectedDate = e.target.value;
        setSelectedDate(selectedDate);

        if(!selectedDate) {
            setfilterRides(rides);
            return;
        }

        const filteredRides = rides.filter(ride => {
            const rideDate = new Date(ride.departureTime);
            return rideDate.toISOString().split('T')[0] === selectedDate;
        });
        
        setfilterRides(filteredRides);
        setCurrentPage(1);

    };

    

    // Calculate the index of the first and last ride on the current page
    const indexOfLastRide = currentPage * ridesPerPage;
    const indexOfFirstRide = indexOfLastRide - ridesPerPage;
    const currentRides = filterRides.slice(indexOfFirstRide, indexOfLastRide);
    const totalPages = Math.ceil(filterRides.length / ridesPerPage);


    if (loading) {
        return <p>Loading...</p>;

    }
    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="my-rides">
             <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
                ← Back
            </button>


            <h1>{role === 'driver' ? 'Rides Offered' : 'Rides Booked'}</h1>
            <div >
                <label >Filter by Date: </label>
                <input type="date" name="date" value={filterDate} onChange={handleDateFiltered} id='dateFilter'/>
            </div>

            {currentRides.length === 0 ? (
                <p>No rides found</p>
            ) : (
                <ul>
                    {currentRides.map((ride)=> (
                        <li key={ride._id} className='ride_item'>
                            <strong>{ride.pickupLo}</strong> → <strong>{ride.dropoffLocation}</strong><br/>
                            Departure : {new Date(ride.departureTime).toLocaleString()}<br/>
                            Driver : {ride.driverId?.name}<br/>
                            fareAmount : ₹{ride.fareAmount || ride.farePerSeat}<br />
                            Seats Available: {ride.availableSeats}
                        </li>
                    ))}
                </ul>
            )}
            
            {totalPages > 1 && (
                <div style={{marginTop : '1rem'}}>
                    {
                        Array.from({length:totalPages},(_, i)=>i+1).map((page) => (
                            <button
                                key={page}
                                onClick={()=> setCurrentPage(page)}
                                style={{
                                    margin : '0 5px',
                                    backgroundColor: currentPage === page ? 'black' : 'white',
                                    color: currentPage === page ? 'white' : 'black',
                                    padding: '4px 8px',
                                    border: '1px solid #000'
                                }}  
                            >
                                {page}
                            </button>
                        ))

                    }

                </div>
            )

            }
        
        </div>
    )
}

export default MyRides;