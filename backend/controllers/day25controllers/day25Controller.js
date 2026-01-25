// nextjs-nodejsbackend-reactfrontend-2026/backend/controllers/day25controllers/day25Controller.js


export const testPropsController = async (req, res) => {
    try {
        const authenticatedUser = req?.user

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "Props test successful",
            user: authenticatedUser,
            props: "This is a test prop value from the server"
        });
    } catch (error) {
        console.error("Error in testPropsController:", error);
        res.status(500).json({ message: "Server error in testPropsController" });
    }
};

export const testuseParamsController = async (req, res) => {
    try {
        const authenticatedUser = req?.user

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "useParams test successful",
            user: authenticatedUser,
            params: "This is a test params value from the server"
        });
    } catch (error) {
        console.error("Error in testuseParamsController:", error);
        res.status(500).json({ message: "Server error in testuseParamsController" });
    }
};

export const testuseSearchParamsController = async (req, res) => {
    try {
        const authenticatedUser = req?.user

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "useSearchParams test successful",
            user: authenticatedUser,
            searchParams: "This is a test searchParams value from the server"
        });
    } catch (error) {
        console.error("Error in testuseSearchParamsController:", error);
        res.status(500).json({ message: "Server error in testuseSearchParamsController" });
    }
};

export const testuseRouterController = async (req, res) => {
    try {
        const authenticatedUser = req?.user

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "useRouter test successful",
            user: authenticatedUser,
            router: "This is a test router value from the server"
        });
    } catch (error) {
        console.error("Error in testuseRouterController:", error);
        res.status(500).json({ message: "Server error in testuseRouterController" });
    }
};

export const testLinkingController = async (req, res) => {
    try {
        const authenticatedUser = req?.user

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "Linking test successful",
            user: authenticatedUser,
            linking: "This is a test linking value from the server"
        });
    } catch (error) {
        console.error("Error in testLinkingController:", error);
        res.status(500).json({ message: "Server error in testLinkingController" });
    }
};  

