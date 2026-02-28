/**
 * api.js — SunnySplash frontend API client
 */

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = path.startsWith("http") ? path : `${BASE_URL}${cleanPath}`;

    console.log(`[API Request] ${options.method || 'GET'} ${url}`);

    try {
        const res = await fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin'
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            console.error(`[API Error] Status: ${res.status} | URL: ${url}`, data);
            throw new Error(data.message || data.detail || `Request failed: ${res.status}`);
        }

        console.log(`[API Success] ${url}`, data);
        return data;
    } catch (error) {
        console.error(`[API Network Error] ${url}`, error);
        if (error.message === "Failed to fetch") {
            throw new Error(`Unable to connect to the backend at ${url}. Ensure the server is running.`);
        }
        throw error;
    }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiRegister({ name, username, email, password }) {
    const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, username, email, password }),
    });
    if (data.token) {
        localStorage.setItem("sp_token", data.token);
    }
    if (data.user) {
        localStorage.setItem("sp_user", JSON.stringify(data.user));
    }
    return data;
}

export async function apiLogin({ identifier, password }) {
    const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
    });
    if (data.token) {
        localStorage.setItem("sp_token", data.token);
    }
    if (data.user) {
        localStorage.setItem("sp_user", JSON.stringify(data.user));
    }
    return data;
}

export async function apiLogout() {
    try {
        await request("/auth/logout", { method: "POST" });
    } catch (e) {
        // Ignore logout errors
    }
    localStorage.removeItem("sp_user");
    localStorage.removeItem("sp_token");
}

export async function apiGetMe() {
    const data = await request("/user/profile");
    return data.user;
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function apiCreateBooking(bookingData) {
    const payload = {
        visitDate: bookingData.visit_date,
        totalPrice: bookingData.total_amount,
        visitors: []
    };

    // Build primary visitor object with photo + biometric landmark vector
    const primaryVisitor = {
        name: JSON.parse(localStorage.getItem("sp_user") || "{}").name || "Primary Visitor",
    };
    if (bookingData.profileImage) {
        primaryVisitor.photo = bookingData.profileImage;
    }
    if (bookingData.faceLandmarks && Array.isArray(bookingData.faceLandmarks)) {
        // Flatten {x, y, z} landmark objects to a single numeric array for storage
        primaryVisitor.landmarkVector = bookingData.faceLandmarks.flatMap(p => [p.x, p.y, p.z]);
    }
    payload.visitors.push(primaryVisitor);

    const extraCount = (bookingData.adult_count || 0) + (bookingData.child_count || 0) + (bookingData.senior_count || 0) - 1;
    for (let i = 0; i < Math.max(0, extraCount); i++) {
        payload.visitors.push({ name: `Visitor ${i + 2}` });
    }

    return request("/tickets/book", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function apiGetMyBookings() {
    const data = await request("/tickets/history");
    return data.tickets;
}

export async function apiCancelBooking(bookingId) {
    return request(`/tickets/status?id=${bookingId}&action=cancel`, { method: "GET" });
}

// ── User Profile ──────────────────────────────────────────────────────────────

export async function apiUpdateProfile(profileData) {
    const data = await request("/user/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
    });
    if (data.user) {
        localStorage.setItem("sp_user", JSON.stringify(data.user));
    }
    return data;
}

// ── Face capture ──────────────────────────────────────────────────────────────

export async function apiUploadFace(imageBase64) {
    // Return the image data directly. 
    // In a real app, this might upload to Cloudinary/S3 first, 
    // but for now we just pass it to the booking API.
    return { profileImage: imageBase64, message: "Face processed" };
}

export async function apiRemoveFace() {
    return apiUpdateProfile({ profileImage: "" });
}

// ── Support ───────────────────────────────────────────────────────────────────

export async function apiRaiseComplaint({ category, title, message }) {
    return { success: true, message: "Complaint received (demo mode)" };
}

export async function apiFeedback({ emoji_rating, slider_rating, comment }) {
    return { success: true, message: "Feedback received (demo mode)" };
}
