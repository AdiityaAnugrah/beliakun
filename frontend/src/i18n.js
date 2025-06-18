import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ========================
// Resources: Translations
// ========================
const resources = {
    en: {
        translation: {
            terms: {
                title: "Terms & Conditions",
                last_updated: "Last updated: June 18, 2025",
                acceptance: "By using our services at beliakun, you agree to the following terms and conditions without exception.",
                transaction: {
                    title: "Transaction Terms",
                    points: [
                    "You must provide accurate and valid information (ID, server, character name, etc).",
                    "Orders are processed within 5 minutes during working hours after payment is confirmed.",
                    "Refunds only apply if we fail to deliver due to internal issues."
                    ]
                },
                services: "beliakun provides digital game services such as top-ups, account sales, game items, and game-related services. We reserve the right to update or terminate services at any time.",
                user_data: "We use your data only for order processing. We do not share your data unless required by law. See our Privacy Policy for details.",
                user_responsibility: "You are fully responsible for the data provided. beliakun is not liable for losses due to user error.",
                modification: "Terms may change at any time. Updates will be shown on this page.",
                contact: "Contact us if you have questions about these terms.",
                contact_info: {
                    email: "Email: admin@beliakun.com",
                    whatsapp: "WhatsApp: +62 812-3456-7890",
                    website: "Website: https://beliakun.com"
                }
                }
                ,
            privacy: {
                title: "Privacy Policy",
                last_updated: "Last updated: June 18, 2025",
                intro: "This page explains how we collect, use, and protect your personal information on beliakun.",
                collected: {
                    title: "What We Collect",
                    items: [
                    "Name or nickname",
                    "User ID & Server ID / Character name",
                    "Game account data (for purchases)",
                    "Email address and WhatsApp number",
                    "Payment method (without storing card data)"
                    ]
                },
                usage: {
                    title: "How We Use Your Data",
                    items: [
                    "To process transactions and orders",
                    "To notify order status",
                    "To improve customer support",
                    "To enhance your experience on our platform"
                    ],
                    note: "We do NOT share your data with any third party unless required by law."
                },
                security: {
                    title: "Data Security",
                    description: "We apply strict internal controls and encrypted communication to ensure your data remains protected."
                },
                rights: {
                    title: "Your Rights",
                    items: [
                    "Request a copy of your personal data",
                    "Request modification or deletion of your data",
                    "Opt-out from promotional usage"
                    ]
                },
                cookies: {
                    title: "Cookies",
                    description: "Our website uses cookies to enhance performance and personalize your experience. You can disable them in your browser settings."
                },
                changes: {
                    title: "Changes to Policy",
                    description: "We may update this policy from time to time. All updates will be posted on this page."
                },
                contact: {
                    title: "Contact Us",
                    email: "Email: admin@beliakun.com",
                    whatsapp: "WhatsApp: +62 812-3456-7890",
                    website: "Website: https://beliakun.com"
                }
                }
                ,
            // ===== Existing Keys (tidak diubah) =====
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
            wishlist_sessionExpired:
                "Your session has expired. Please log in again.",

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

            // ===== New Keys for Verification OTP =====
            verification: "Verification",
            enter_code: "Please enter the code that we provide via Email",
            enter_otp_sent_to: "Please enter the code sent to",
            otp_placeholder: "Enter 6-digit code",
            otp_required: "OTP is required.",
            verify: "Verify",
            verifying: "Verifying...",
            verify_failed: "Verification failed. Please try again.",
            verify_success: "Email verified successfully.",
            please_wait: "Please wait",
            seconds_to_resend: "seconds to resend",
            resend_code: "Resend Code",

            // ===== New Keys for OTP Verification =====
            otp_verification: "OTP Verification",
            otp_sent_to: "An OTP has been sent to your email.",
            enter_otp: "Please enter the OTP sent to your email",
            
            // ===== New Keys for Product Management =====
            product_management: "Product Management",
            add_new_product: "Add New Product",
            edit_existing_product: "Edit Existing Product",
            product_name: "Product Name",
            product_description: "Product Description",
            product_price: "Product Price",
            product_stock: "Product Stock",
            product_image: "Product Image",
            product_category: "Product Category",
            product_tags: "Product Tags",
            product_created: "Product created successfully!",
            product_updated: "Product updated successfully!",
            product_deleted: "Product deleted successfully!",
            product_add_failed: "Failed to add product. Please try again.",
            product_update_failed: "Failed to update product. Please try again.",
            product_delete_failed: "Failed to delete product. Please try again.",
            product_list: "Product List",
            product_not_found: "Product not found.",
            product_search: "Search Products",
            product_filter: "Filter Products",
            product_sort: "Sort Products",
            product_sort_by: "Sort by",

            product_sort_options: {
                name_asc: "Name (A-Z)",
                name_desc: "Name (Z-A)",
                price_asc: "Price (Low to High)",
                price_desc: "Price (High to Low)",
                newest: "Newest",
                oldest: "Oldest",
            },
            product_filter_options: {
                all: "All",
                electronics: "Electronics",
                fashion: "Fashion",
                home_appliances: "Home Appliances",
                books: "Books",
                beauty: "Beauty & Health",
            },
            product_no_results: "No products found matching your criteria.",
            product_add_to_cart: "Add to Cart",
            product_add_to_wishlist: "Add to Wishlist",

            // ===== New Keys for Home =====
            btn_see_all_products: "See All",
            home_page_title: "Welcome to Our Store",
            home_page_description: "Discover the best products at unbeatable prices.",
            home_featured_products: "Featured Products",
            home_latest_products: "Latest Products",
            home_popular_products: "Popular Products",
            home_top_rated_products: "Top Rated Products",
            home_best_selling_products: "Best Selling Products",
            home_discounted_products: "Discounted Products",
            home_new_products: "New Products",
            home_all_products: "All Products",
            home_view_all_products: "View All Products",
            home_no_products: "No products found.",            
            },
            payment: {
            title: "Payment Information",
            order_id: "Order ID",
            status: "Payment Status",
            summary: "Order Summary",
            price: "Price",
            qty: "Quantity",
            instructions: "Please Make Payment",
            pending_msg: "Your payment is still pending. Please complete the payment before expiration.",
            expires: "Expires in",
            total: "Total Amount",
            transfer_to: "Transfer to",
            bank: "Bank",
            va_number: "VA Number",
            copy_va: "Copy VA Number",
            qris_title: "Pay with QRIS",
            copy_qris: "Copy QRIS",
            success_msg: "Your transaction was successful. Thank you!",
            failed_msg: "Payment failed. Please try again.",
            not_found: "Payment information not found.",
            footer_msg: "Please do not close this page until the payment is complete."
            },
            time: {
                days: "days",
                hours: "hours",
                minutes: "minutes",
                seconds: "seconds",
                expired: "Expired"
            },
            notif: {
                updated: "Payment status for Order ID",
                updated_to: "has been updated to",
                unauthorized: "You must be logged in to access this information.",
                copied_va: "VA number copied!",
                copied_qris: "QRIS copied!"
            }
        },

    id: {
        translation: {
            terms: {
                title: "Syarat & Ketentuan",
                last_updated: "Terakhir diperbarui: 18 Juni 2025",
                acceptance: "Dengan menggunakan layanan beliakun, Anda dianggap telah menyetujui semua syarat dan ketentuan berikut ini tanpa pengecualian.",
                transaction: {
                    title: "Ketentuan Transaksi",
                    points: [
                    "Anda wajib memberikan data yang valid dan benar (ID, server, nama karakter, dll).",
                    "Pesanan diproses maksimal 5 menit setelah pembayaran terkonfirmasi (selama jam kerja).",
                    "Pengembalian dana hanya berlaku jika kami gagal memproses pesanan karena kesalahan internal."
                    ]
                },
                services: "beliakun menyediakan layanan digital game seperti top up, jual beli akun, item game, dan layanan terkait lainnya. Kami berhak mengubah atau menghentikan layanan sewaktu-waktu.",
                user_data: "Data Anda digunakan hanya untuk memproses pesanan. Kami tidak membagikan data Anda kecuali diwajibkan oleh hukum. Baca selengkapnya di Kebijakan Privasi.",
                user_responsibility: "Pengguna bertanggung jawab atas data yang diberikan. beliakun tidak bertanggung jawab atas kerugian akibat kesalahan pengguna.",
                modification: "Syarat & Ketentuan dapat berubah sewaktu-waktu dan akan diperbarui di halaman ini.",
                contact: "Hubungi kami jika ada pertanyaan terkait syarat & ketentuan ini.",
                contact_info: {
                    email: "Email: admin@beliakun.com",
                    whatsapp: "WhatsApp: +62 812-3456-7890",
                    website: "Website: https://beliakun.com"
                }
                }
                ,
            privacy: {
                title: "Kebijakan Privasi",
                last_updated: "Terakhir diperbarui: 18 Juni 2025",
                intro: "Halaman ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda di beliakun.",
                collected: {
                    title: "Data yang Kami Kumpulkan",
                    items: [
                    "Nama atau nama panggilan",
                    "User ID & Server ID / Nama karakter",
                    "Data akun game (untuk pembelian/jasa)",
                    "Alamat email dan nomor WhatsApp",
                    "Metode pembayaran (tanpa menyimpan data kartu)"
                    ]
                },
                usage: {
                    title: "Bagaimana Kami Menggunakan Data Anda",
                    items: [
                    "Memproses transaksi dan pesanan",
                    "Memberikan status pesanan",
                    "Meningkatkan layanan pelanggan",
                    "Meningkatkan pengalaman pengguna di platform"
                    ],
                    note: "Kami TIDAK membagikan data Anda kepada pihak lain, kecuali diwajibkan oleh hukum."
                },
                security: {
                    title: "Keamanan Data",
                    description: "Kami menggunakan kontrol internal yang ketat dan komunikasi terenkripsi untuk menjaga keamanan data Anda."
                },
                rights: {
                    title: "Hak Anda",
                    items: [
                    "Meminta salinan data pribadi Anda",
                    "Meminta pengubahan atau penghapusan data",
                    "Menolak penggunaan data untuk promosi"
                    ]
                },
                cookies: {
                    title: "Cookies",
                    description: "Situs kami menggunakan cookies untuk meningkatkan performa dan personalisasi pengalaman Anda. Anda dapat menonaktifkan cookies di pengaturan browser."
                },
                changes: {
                    title: "Perubahan Kebijakan",
                    description: "Kami dapat memperbarui kebijakan ini sewaktu-waktu. Semua perubahan akan diumumkan di halaman ini."
                },
                contact: {
                    title: "Hubungi Kami",
                    email: "Email: admin@beliakun.com",
                    whatsapp: "WhatsApp: +62 812-3456-7890",
                    website: "Website: https://beliakun.com"
                }
                }
                ,
            // ===== Existing Keys (tidak diubah) =====
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
            wishlist_sessionExpired:
                "Sesi Anda telah berakhir. Silakan login kembali.",

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

            // ===== New Keys for Verification OTP =====
            verification: "Verifikasi",
            enter_code: "Masukkan kode yang kami kirim via Email",
            enter_otp_sent_to: "Masukkan kode yang dikirim ke",
            otp_placeholder: "Masukkan kode 6-digit",
            otp_required: "OTP harus diisi.",
            verify: "Verifikasi",
            verifying: "Memverifikasi...",
            verify_failed: "Verifikasi gagal. Silakan coba lagi.",
            verify_success: "Email berhasil diverifikasi.",
            please_wait: "Mohon tunggu",
            seconds_to_resend: "detik untuk kirim ulang",
            resend_code: "Kirim Ulang",
            // ===== New Keys for OTP Verification =====
            otp_verification: "Verifikasi OTP",
            otp_sent_to: "OTP telah dikirim ke email Anda.",
            enter_otp: "Masukkan OTP yang dikirim ke email Anda",
            // ===== New Keys for Product Management =====
            product_management: "Manajemen Produk",
            product_name: "Nama Produk",
            product_description: "Deskripsi Produk",
            product_price: "Harga Produk",
            product_stock: "Stok Produk",
            product_image: "Gambar Produk",
            product_category: "Kategori Produk",
            product_tags: "Tag Produk",
            product_created: "Produk berhasil dibuat!",
            product_updated: "Produk berhasil diperbarui!",
            product_deleted: "Produk berhasil dihapus!",
            product_add_failed: "Gagal menambahkan produk. Silakan coba lagi.",
            product_update_failed: "Gagal memperbarui produk. Silakan coba lagi.",
            product_delete_failed: "Gagal menghapus produk. Silakan coba lagi.",
            product_list: "Daftar Produk",
            product_not_found: "Produk tidak ditemukan.",
            product_search: "Cari Produk",
            product_filter: "Filter Produk",
            product_sort: "Urutkan Produk",
            product_sort_by: "Urutkan berdasarkan",
            product_sort_options: {
                name_asc: "Nama (A-Z)",
                name_desc: "Nama (Z-A)",
                price_asc: "Harga (Rendah ke Tinggi)",
                price_desc: "Harga (Tinggi ke Rendah)",
                newest: "Terbaru",
                oldest: "Terlama",
            },
            product_filter_options: {
                all: "Semua",
                electronics: "Elektronik",
                fashion: "Fashion",
                home_appliances: "Peralatan Rumah Tangga",
                books: "Buku",
                beauty: "Kecantikan & Kesehatan",
            },
            product_no_results: "Tidak ada produk yang ditemukan sesuai kriteria.",
            product_add_to_cart: "Tambahkan ke Keranjang",
            product_add_to_wishlist: "Tambahkan ke Wishlist",
            // ===== New Keys for Home =====
            btn_see_all_products: "Semua Produk",
            home_page_title: "Selamat Datang di Toko Kami",
            home_page_description: "Temukan produk terbaik dengan harga yang tak tertandingi.",
            home_featured_products: "Produk Unggulan",
            home_latest_products: "Produk Terbaru",
            home_popular_products: "Produk Populer",
            home_top_rated_products: "Produk Terbaik",
            home_best_selling_products: "Produk Terlaris",
            home_discounted_products: "Produk Diskon",

            home_new_products: "Produk Baru",
            home_all_products: "Semua Produk",
            home_view_all_products: "Lihat Semua Produk",
            home_no_products: "Tidak ada produk yang ditemukan.",

            },
            payment: {
            title: "Informasi Pembayaran",
            order_id: "ID Pesanan",
            status: "Status Pembayaran",
            summary: "Ringkasan Pesanan",
            price: "Harga",
            qty: "Jumlah",
            instructions: "Silakan Lakukan Pembayaran",
            pending_msg: "Pembayaran Anda masih pending. Silakan selesaikan sebelum waktu habis.",
            expires: "Berakhir dalam",
            total: "Total Tagihan",
            transfer_to: "Transfer ke",
            bank: "Bank",
            va_number: "Nomor VA",
            copy_va: "Salin Nomor VA",
            qris_title: "Bayar dengan QRIS",
            copy_qris: "Salin QRIS",
            success_msg: "Transaksi Anda berhasil. Terima kasih!",
            failed_msg: "Pembayaran gagal. Silakan coba lagi.",
            not_found: "Informasi pembayaran tidak ditemukan.",
            footer_msg: "Silakan jangan tutup halaman ini sampai pembayaran selesai."
        },
        time: {
            days: "hari",
            hours: "jam",
            minutes: "menit",
            seconds: "detik",
            expired: "Kadaluarsa"
        },
        notif: {
            updated: "Status pembayaran untuk Order ID",
            updated_to: "telah diperbarui menjadi",
            unauthorized: "Anda harus login untuk mengakses informasi ini.",
            copied_va: "Nomor VA berhasil disalin!",
            copied_qris: "QRIS berhasil disalin!"
        }
        
        },  
};

// ========================
// i18n Initialization
// ========================
i18n.use(initReactI18next).init({
    resources,
    lng: "en", // Default language
    fallbackLng: "id",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
