export const testPropsController = async (req, res) => {
    try {
        const authenticatedUser = req?.user;

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "Day26 props test successful",
            user: authenticatedUser,
            props: "This is a Day26 test prop value from the server"
        });
    } catch (error) {
        console.error("Error in Day26 testPropsController:", error);
        res.status(500).json({ message: "Server error in Day26 testPropsController" });
    }
};

export const testuseParamsController = async (req, res) => {
    try {
        const authenticatedUser = req?.user;

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "Day26 useParams test successful",
            user: authenticatedUser,
            params: "This is a Day26 test params value from the server"
        });
    } catch (error) {
        console.error("Error in Day26 testuseParamsController:", error);
        res.status(500).json({ message: "Server error in Day26 testuseParamsController" });
    }
};

export const testuseSearchParamsController = async (req, res) => {
    try {
        const authenticatedUser = req?.user;

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "Day26 useSearchParams test successful",
            user: authenticatedUser,
            searchParams: "This is a Day26 test searchParams value from the server"
        });
    } catch (error) {
        console.error("Error in Day26 testuseSearchParamsController:", error);
        res.status(500).json({ message: "Server error in Day26 testuseSearchParamsController" });
    }
};

export const testuseRouterController = async (req, res) => {
    try {
        const authenticatedUser = req?.user;

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "Day26 useRouter test successful",
            user: authenticatedUser,
            router: "This is a Day26 test router value from the server"
        });
    } catch (error) {
        console.error("Error in Day26 testuseRouterController:", error);
        res.status(500).json({ message: "Server error in Day26 testuseRouterController" });
    }
};

export const testLinkingController = async (req, res) => {
    try {
        const authenticatedUser = req?.user;

        if (!authenticatedUser) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        res.status(200).json({
            message: "Day26 linking test successful",
            user: authenticatedUser,
            linking: "This is a Day26 test linking value from the server"
        });
    } catch (error) {
        console.error("Error in Day26 testLinkingController:", error);
        res.status(500).json({ message: "Server error in Day26 testLinkingController" });
    }
};
