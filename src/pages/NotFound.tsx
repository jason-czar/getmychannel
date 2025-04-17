
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkForSubdomain = async () => {
      // Log the 404 error for debugging
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );

      // Check if this is a root path access that might be from a subdomain
      if (location.pathname === "/" || location.pathname === "") {
        // Get the hostname from the browser
        const hostname = window.location.hostname;
        
        console.log("Checking hostname:", hostname);
        
        // Extract potential subdomain - handle both .com.channel and direct subdomain access
        let subdomain = null;
        
        if (hostname.endsWith(".com.channel")) {
          // Format: subdomain.com.channel
          subdomain = hostname.split(".")[0];
        } else if (hostname.includes(".")) {
          // Format could be subdomain.yourdomain.com
          subdomain = hostname.split(".")[0];
        }
        
        if (subdomain) {
          console.log("Detected potential subdomain:", subdomain);
          
          try {
            // Check if this subdomain exists in our database
            const { data, error } = await supabase
              .from("domains")
              .select("id, settings, is_active")
              .eq("subdomain", subdomain)
              .maybeSingle();
            
            if (error) throw error;
            
            if (data) {
              console.log("Found domain data:", data);
              
              // Check if domain has forwarding settings
              if (data.settings?.forwarding?.url) {
                console.log("Forwarding to:", data.settings.forwarding.url);
                window.location.href = data.settings.forwarding.url;
                return;
              }
              
              // Redirect to the subdomain landing page
              navigate(`/domain/${subdomain}`);
              return;
            } else {
              console.log("Subdomain not found in database");
            }
          } catch (err) {
            console.error("Error checking subdomain:", err);
          }
        }
      }
      
      setChecking(false);
    };

    checkForSubdomain();
  }, [location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
        <span>Checking page...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
