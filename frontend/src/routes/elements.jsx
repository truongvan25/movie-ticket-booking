import { PATH, ADMIN_PATH, MANAGER_PATH } from "./path";
import { useRoutes } from "react-router-dom";

import AdminLayout from "../pages/admin/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminMovies from "../pages/admin/AdminMovies.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminTheaters from "../pages/admin/AdminTheaters.jsx";
import AdminBookings from "../pages/admin/AdminBookings.jsx";
import AdminRevenue from "../pages/admin/AdminRevenue.jsx";

import ManagerLayout from "../pages/manager/ManagerLayout.jsx";
import ManagerDashboard from "../pages/manager/ManagerDashboard.jsx";
import ManagerMovies from "../pages/manager/ManagerMovies.jsx";
import ManagerShows from "../pages/manager/ManagerShows.jsx";
import ManagerRooms from "../pages/manager/ManagerRooms.jsx";
import ManagerBookings from "../pages/manager/ManagerBookings.jsx";
import ManagerReviews from "../pages/manager/ManagerReviews.jsx";

import AdminReviews from "../pages/admin/AdminReviews.jsx";
import AdminSupport from "../pages/admin/AdminSupport.jsx";
import AdminPromoCodes from "../pages/admin/AdminPromoCodes.jsx";

import HomeLayout from "../components/layout/HomeLayout";
import AuthLayout from "../components/layout/AuthLayout";
import HomePage from "../pages/customer/HomePage.jsx";
import LoginPage from "../pages/auth/SigninPage";
import SignupPage from "../pages/auth/SignupPage";
import NotFound from "../pages/NotFound";
import MovieDetails from "../pages/customer/MovieDetails.jsx";
import Booking from "../pages/customer/Booking.jsx";
import Movies from "../pages/customer/Movies.jsx";
import MyTickets from "../pages/customer/MyTickets.jsx";
import BookingHistory from "../pages/customer/BookingHistory.jsx";
import ProfilePage from "../pages/customer/ProfilePage.jsx";
import SupportPage from "../pages/customer/SupportPage.jsx";
import FavoritesPage from "../pages/customer/FavoritesPage.jsx";
import SigninPage from "../pages/auth/SigninPage";
import VerifyMailPage from "../pages/auth/VerifyEmailPage";



const useRouterElements = () => {
    const elements = useRoutes([
        {
            path: PATH.HOME,
            element: <HomeLayout />,
            children: [
                {
                    index: true,
                    element: <HomePage />,
                },
                {
                    path: `${PATH.MOVIE_DETAILS}/:movieId`,
                    element: <MovieDetails />,
                },
                {
                    path: `${PATH.BOOKING}/:movieId`,
                    element: <Booking />,
                },
                {
                    path: PATH.ONGOING,
                    element: <Movies />,
                },
                {
                    path: PATH.COMING_SOON,
                    element: <Movies />,
                },
                {
                    path: PATH.MY_TICKETS,
                    element: <MyTickets />,
                },
                {
                    path: PATH.BOOKING_HISTORY,
                    element: <BookingHistory />,
                },
                {
                    path: PATH.PROFILE,
                    element: <ProfilePage />,
                },
                {
                    path: PATH.SUPPORT,
                    element: <SupportPage />,
                },
                {
                    path: PATH.FAVORITES,
                    element: <FavoritesPage />,
                },
            ]
        },
        {
            path: PATH.ADMIN,
            element: <AdminLayout />,
            children: [
                {
                    path: ADMIN_PATH.DASHBOARD,
                    element: <AdminDashboard />,
                },
                {
                    path: ADMIN_PATH.MOVIES,
                    element: <AdminMovies />,
                },
                {
                    path: ADMIN_PATH.USERS,
                    element: <AdminUsers />,
                },
                {
                    path: ADMIN_PATH.THEATERS,
                    element: <AdminTheaters />,
                },
                {
                    path: ADMIN_PATH.BOOKINGS,
                    element: <AdminBookings />,
                },
                {
                    path: ADMIN_PATH.REVENUE,
                    element: <AdminRevenue />,
                },
                {
                    path: ADMIN_PATH.REVIEWS,
                    element: <AdminReviews />,
                },
                {
                    path: ADMIN_PATH.SUPPORT,
                    element: <AdminSupport />,
                },
                {
                    path: ADMIN_PATH.PROMO_CODES,
                    element: <AdminPromoCodes />,
                },
            ]
        },
        {
            path: PATH.MANAGER,
            element: <ManagerLayout />,
            children: [
                { path: MANAGER_PATH.DASHBOARD, element: <ManagerDashboard /> },
                { path: MANAGER_PATH.MOVIES,    element: <ManagerMovies /> },
                { path: MANAGER_PATH.SHOWS,     element: <ManagerShows /> },
                { path: MANAGER_PATH.ROOMS,     element: <ManagerRooms /> },
                { path: MANAGER_PATH.BOOKINGS,  element: <ManagerBookings /> },
                { path: MANAGER_PATH.REVIEWS,  element: <ManagerReviews /> },
            ]
        },
        {
            path: "/auth",
            element: <AuthLayout />,
            children: [
                {
                    path: PATH.SIGNIN,
                    element: <SigninPage />,
                },
                {
                    path: PATH.SIGNUP,
                    element: <SignupPage />,
                },
                {
                    path: PATH.VERIFY_EMAIL,
                    element: <VerifyMailPage />,
                }
            ]
        },
        {
            path: "*",
            element: <NotFound />,
        }
    ]);

    return elements;
};

export default useRouterElements;