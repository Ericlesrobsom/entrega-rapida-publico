import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Products from "./Products";

import Orders from "./Orders";

import Deliverers from "./Deliverers";

import Store from "./Store";

import MyOrders from "./MyOrders";

import Settings from "./Settings";

import Banners from "./Banners";

import Home from "./Home";

import teste-custom from "./teste-custom";

import Categories from "./Categories";

import DeliveryMethods from "./DeliveryMethods";

import Advertisements from "./Advertisements";

import Questions from "./Questions";

import Coupons from "./Coupons";

import Courses from "./Courses";

import CoursePlayer from "./CoursePlayer";

import CourseEditor from "./CourseEditor";

import Links from "./Links";

import SocialLinks from "./SocialLinks";

import GlobalOffers from "./GlobalOffers";

import MyProfile from "./MyProfile";

import Affiliates from "./Affiliates";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Products: Products,
    
    Orders: Orders,
    
    Deliverers: Deliverers,
    
    Store: Store,
    
    MyOrders: MyOrders,
    
    Settings: Settings,
    
    Banners: Banners,
    
    Home: Home,
    
    teste-custom: teste-custom,
    
    Categories: Categories,
    
    DeliveryMethods: DeliveryMethods,
    
    Advertisements: Advertisements,
    
    Questions: Questions,
    
    Coupons: Coupons,
    
    Courses: Courses,
    
    CoursePlayer: CoursePlayer,
    
    CourseEditor: CourseEditor,
    
    Links: Links,
    
    SocialLinks: SocialLinks,
    
    GlobalOffers: GlobalOffers,
    
    MyProfile: MyProfile,
    
    Affiliates: Affiliates,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Orders" element={<Orders />} />
                
                <Route path="/Deliverers" element={<Deliverers />} />
                
                <Route path="/Store" element={<Store />} />
                
                <Route path="/MyOrders" element={<MyOrders />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Banners" element={<Banners />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/teste-custom" element={<teste-custom />} />
                
                <Route path="/Categories" element={<Categories />} />
                
                <Route path="/DeliveryMethods" element={<DeliveryMethods />} />
                
                <Route path="/Advertisements" element={<Advertisements />} />
                
                <Route path="/Questions" element={<Questions />} />
                
                <Route path="/Coupons" element={<Coupons />} />
                
                <Route path="/Courses" element={<Courses />} />
                
                <Route path="/CoursePlayer" element={<CoursePlayer />} />
                
                <Route path="/CourseEditor" element={<CourseEditor />} />
                
                <Route path="/Links" element={<Links />} />
                
                <Route path="/SocialLinks" element={<SocialLinks />} />
                
                <Route path="/GlobalOffers" element={<GlobalOffers />} />
                
                <Route path="/MyProfile" element={<MyProfile />} />
                
                <Route path="/Affiliates" element={<Affiliates />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}