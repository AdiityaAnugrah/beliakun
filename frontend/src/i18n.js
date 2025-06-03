import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ========================
// Resources: Translations
// ========================
const resources = {
    en: {
        translation: {
            // Auth & Account
            create_account: "Create an Account",
            full_name: "Full Name",
            email: "Email",
            username: "Username",
            password: "Password (min. 6 characters)",
            security_verification: "Security Verification",
            already_have_account: "Already have an account?",
            login_here: "Log in here",
            signup_failed: "Signup failed. Please try again.",
            please_fill_all_fields: "Please fill in all fields correctly.",
            name_required: "Name is required.",
            email_required: "Email is required.",
            username_required: "Username is required.",
            password_required: "Password must be at least 6 characters.",
            captcha_required: "Please verify the captcha.",

            // General UI
            about_us: "About Us",
            welcome: "Welcome",
            login: "Login",
            signup: "Sign Up",
            logout: "Logout",
            profile: "Profile",
            settings: "Settings",
            loading: "Loading...",
            success: "Success",
            error: "Error",
            go_back: "Go Back",
            home: "Home",
            submit: "Submit",
            cancel: "Cancel",
            update: "Update",
            delete: "Delete",
            add_new: "Add New",
            view_details: "View Details",

            // Errors
            invalid_credentials: "Invalid credentials, please try again.",
            email_taken: "This email is already registered.",
            username_taken: "This username is already taken.",
            password_mismatch: "Passwords do not match.",

            // Footer
            our_partners: "Our Partners",
            cloudflare: "Cloudflare",
            midtrans: "Midtrans",
            terms_conditions: "Terms & Conditions",
            privacy_policy: "Privacy Policy",
            all_rights_reserved: "All rights reserved",

            // Auth states
            login_success: "Login success!",
            login_failed: "Login failed. Please try again.",
            dont_have_account: "Don’t have an account?",
            sign_up: "Sign up",
            welcome_user: "Welcome, {{username}}!",
            logout_successful: "Logout successful",

            // Product
            product_details: "Product Details",
            add_product: "Add Product",
            edit_product: "Edit Product",

            // Cart
            cart: {
                title: "Cart",
                empty: "Your cart is empty.",
                total: "Total",
                checkout: "Checkout",
                notLogin: "You are not logged in.",
                maxStok: "Not enough stock available.",
                loading: "Loading cart...",
                removeItem: "Remove item",
                stockAvailable: "Stock available: {{stok}}",
                addSuccess: "Product added to cart successfully!",
                addFailed: "Failed to add product to cart.",
                outOfStock: "Product is out of stock.",
                updated: "Cart updated successfully.",
                deleted: "Item removed from cart.",
            },

            wishlist_added: "Added to wishlist!",
            wishlist_removed: "Removed from wishlist!",
            wishlist_notLogin: "You need to log in to add to wishlist.",
            wishlist_sessionExpired: "Your session has expired. Please log in again.",

            // Checkout
            checkout: {
                title: "Checkout",
                fullName: "Full Name",
                address: "Complete Address",
                note: "Note",
                summary: "Order Summary",
                total: "Total",
                required: "Name and address are required.",
                success: "Payment successful!",
                pending: "Payment is still being processed.",
                error: "Payment failed.",
                closed: "You closed the payment popup.",
                payNow: "Pay Now",
                processing: "Processing...",
                failed: "Checkout failed.",
            },
        },
    },

    id: {
        translation: {
            // Auth & Akun
            create_account: "Buat Akun Baru",
            full_name: "Nama Lengkap",
            email: "Email",
            username: "Username",
            password: "Password (min. 6 karakter)",
            security_verification: "Verifikasi Keamanan",
            already_have_account: "Sudah punya akun?",
            login_here: "Masuk di sini",
            signup_failed: "Pendaftaran gagal. Silakan coba lagi.",
            please_fill_all_fields: "Harap isi semua field dengan benar.",
            name_required: "Nama harus diisi.",
            email_required: "Email harus diisi.",
            username_required: "Username harus diisi.",
            password_required: "Password harus memiliki minimal 6 karakter.",
            captcha_required: "Harap verifikasi captcha.",

            // Umum
            about_us: "Tentang Kami",
            welcome: "Selamat Datang",
            login: "Masuk",
            signup: "Daftar",
            logout: "Keluar",
            profile: "Profil",
            settings: "Pengaturan",
            loading: "Memuat...",
            success: "Berhasil",
            error: "Kesalahan",
            go_back: "Kembali",
            home: "Beranda",
            submit: "Kirim",
            cancel: "Batal",
            update: "Perbarui",
            delete: "Hapus",
            add_new: "Tambah Baru",
            view_details: "Lihat Detail",

            // Error
            invalid_credentials: "Kredensial salah, silakan coba lagi.",
            email_taken: "Email ini sudah terdaftar.",
            username_taken: "Username ini sudah terpakai.",
            password_mismatch: "Password tidak cocok.",

            // Footer
            our_partners: "Mitra Kami",
            cloudflare: "Cloudflare",
            midtrans: "Midtrans",
            terms_conditions: "Syarat & Ketentuan",
            privacy_policy: "Kebijakan Privasi",
            all_rights_reserved: "Hak cipta dilindungi",

            // Auth state
            login_success: "Login berhasil!",
            login_failed: "Login gagal. Silakan coba lagi.",
            dont_have_account: "Belum punya akun?",
            sign_up: "Daftar",
            welcome_user: "Selamat datang, {{username}}!",
            logout_successful: "Keluar berhasil",

            // Produk
            product_details: "Detail Produk",
            add_product: "Tambah Produk",
            edit_product: "Edit Produk",

            // Keranjang
            cart: {
                title: "Keranjang Belanja",
                loading: "Memuat keranjang...",
                empty: "Keranjang kosong.",
                notLogin: "Anda belum login.",
                maxStok: "Stok tidak mencukupi.",
                stockAvailable: "Stok tersedia: {{stok}}",
                removeItem: "Hapus produk",
                total: "Total",
                checkout: "Checkout",
                addFailed: "Gagal menambahkan produk ke keranjang.",
                addSuccess: "Produk berhasil ditambahkan ke keranjang!",
                outOfStock: "Produk sedang habis.",
                updated: "Keranjang berhasil diperbarui.",
                deleted: "Produk berhasil dihapus dari keranjang.",
            },

            wishlist_added: "Ditambahkan ke wishlist!",
            wishlist_removed: "Dihapus dari wishlist!",
            wishlist_notLogin: "Silakan login untuk menambah ke wishlist.",
            wishlist_sessionExpired: "Sesi Anda telah berakhir. Silakan login kembali.",

            // Checkout
            checkout: {
                title: "Checkout",
                required: "Nama dan alamat harus diisi.",
                fullName: "Nama Lengkap",
                address: "Alamat Lengkap",
                note: "Catatan (opsional)",
                summary: "Ringkasan Pesanan",
                total: "Total",
                payNow: "Bayar Sekarang",
                processing: "Memproses...",
                success: "Pembayaran berhasil!",
                pending: "Pembayaran masih diproses.",
                error: "Terjadi kesalahan dalam pembayaran.",
                closed: "Kamu menutup pembayaran.",
                failed: "Checkout gagal.",
            },
        },
    },
};

// ========================
// i18n Initialization
// ========================
i18n.use(initReactI18next).init({
    resources,
    lng: "en", // ganti ke "en" jika ingin default bahasa Inggris
    fallbackLng: "id",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
