import React from "react";
import MyRides from "../../component/rides/MyRides";

const MyRidesPage = () => {
    // you should get this from auth context or LocalStorage
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role')

    if(!userId || !role) return <p>please login in to view your rides.</p>

    return (
        <div>
            <h1>My Rides</h1>
            <MyRides userId={userId} role={role} />
        </div>
    )
}

export default MyRidesPage