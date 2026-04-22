import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import User from "./src/models/user.model.js";
import TheaterSystem from "./src/models/theaterSystem.model.js";
import Theater from "./src/models/theater.model.js";
import Movie from "./src/models/movie.model.js";
import Room from "./src/models/rooms.model.js";
import Seat from "./src/models/seat.model.js";
import Show from "./src/models/show.model.js";
import Booking from "./src/models/booking.model.js";
import Ticket from "./src/models/ticket.model.js";
import Review from "./src/models/review.model.js";

const SEAT_ROWS = ["A", "B", "C", "D", "E", "F"];
const SEAT_COLS = 8;
const VIP_ROWS = ["E", "F"];

const SEAT_PRICE = { standard: 90000, vip: 120000, couple: 160000 };

async function hash(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

function buildShowTimes(today, duration, dayOffset) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    const slots = [
        { h: 10, m: 0 },
        { h: 14, m: 0 },
        { h: 19, m: 30 },
    ];

    return slots.map(({ h, m }) => {
        const start = new Date(date);
        start.setHours(h, m, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration + 15); // +15 phút quảng cáo
        return { startTime: start, endTime: end };
    });
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB Atlas");

    // ── Xóa toàn bộ dữ liệu cũ ──────────────────────────────────────────────
    await Promise.all([
        User.deleteMany({}),
        TheaterSystem.deleteMany({}),
        Theater.deleteMany({}),
        Movie.deleteMany({}),
        Room.deleteMany({}),
        Seat.deleteMany({}),
        Show.deleteMany({}),
        Booking.deleteMany({}),
        Ticket.deleteMany({}),
        Review.deleteMany({}),
    ]);
    console.log("🗑️  Cleared all collections\n");

    // ── USERS ─────────────────────────────────────────────────────────────────
    const [adminPwd, mgrPwd, custPwd] = await Promise.all([
        hash("Admin123@"),
        hash("Manager123@"),
        hash("Customer123@"),
    ]);

    const [admin, manager1, manager2, customer1, customer2, customer3] =
        await User.insertMany([
            {
                email: "admin@cinebook.com",
                userName: "Super Admin",
                password: adminPwd,
                role: "admin",
                isVerified: true,
            },
            {
                email: "manager1@cinebook.com",
                userName: "CGV Manager",
                password: mgrPwd,
                role: "theater-manager",
                isVerified: true,
            },
            {
                email: "manager2@cinebook.com",
                userName: "Lotte Manager",
                password: mgrPwd,
                role: "theater-manager",
                isVerified: true,
            },
            {
                email: "customer1@cinebook.com",
                userName: "Nguyễn Văn An",
                password: custPwd,
                role: "customer",
                isVerified: true,
            },
            {
                email: "customer2@cinebook.com",
                userName: "Trần Thị Bình",
                password: custPwd,
                role: "customer",
                isVerified: true,
            },
            {
                email: "customer3@cinebook.com",
                userName: "Lê Hoàng Cường",
                password: custPwd,
                role: "customer",
                isVerified: true,
            },
        ]);
    console.log("👥 Created 6 users");

    // ── THEATER SYSTEMS ───────────────────────────────────────────────────────
    const [cgv, lotte] = await TheaterSystem.insertMany([
        {
            name: "CGV Cinemas",
            code: "CGV",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/CGV_Cinemas_logo.svg/200px-CGV_Cinemas_logo.svg.png",
            description: "Chuỗi rạp chiếu phim CGV – thương hiệu Hàn Quốc hàng đầu Việt Nam",
        },
        {
            name: "Lotte Cinema",
            code: "LOTTE",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Lotte_Cinema_Logo.svg/200px-Lotte_Cinema_Logo.svg.png",
            description: "Chuỗi rạp chiếu phim Lotte Cinema – đẳng cấp từ Hàn Quốc",
        },
    ]);
    console.log("🏢 Created 2 theater systems");

    // ── THEATERS ──────────────────────────────────────────────────────────────
    const [th1, th2, th3, th4] = await Theater.insertMany([
        {
            managerId: manager1._id,
            theaterName: "CGV Vincom Center Bà Triệu",
            location: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
            theaterSystemId: cgv._id,
        },
        {
            managerId: manager1._id,
            theaterName: "CGV Crescent Mall",
            location: "101 Tôn Dật Tiên, Quận 7, TP. HCM",
            theaterSystemId: cgv._id,
        },
        {
            managerId: manager2._id,
            theaterName: "Lotte Cinema Nowzone",
            location: "235 Nguyễn Văn Cừ, Quận 1, TP. HCM",
            theaterSystemId: lotte._id,
        },
        {
            managerId: manager2._id,
            theaterName: "Lotte Cinema Diamond Plaza",
            location: "34 Lê Duẩn, Quận 1, TP. HCM",
            theaterSystemId: lotte._id,
        },
    ]);
    console.log("🎭 Created 4 theaters");

    // ── MOVIES ────────────────────────────────────────────────────────────────
    const moviesData = [
        // Đang chiếu
        {
            movieName: "Avengers: Endgame",
            description:
                "Sau sự kiện thảm khốc của Infinity War, các Avengers còn sống sót tập hợp một lần cuối để đảo ngược hành động của Thanos và khôi phục lại trật tự vũ trụ.",
            genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
            duration: 181,
            releaseDate: new Date("2024-01-15"),
            poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg",
            ageRating: "T13",
            status: "ongoing",
            theaterManagerId: manager1._id,
        },
        {
            movieName: "Spider-Man: No Way Home",
            description:
                "Danh tính của Spider-Man bị lộ buộc Peter Parker cầu cứu Doctor Strange, nhưng một câu thần chú thất bại đã mở ra cánh cổng đa vũ trụ nguy hiểm.",
            genres: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
            duration: 148,
            releaseDate: new Date("2024-02-01"),
            poster: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg",
            ageRating: "T13",
            status: "ongoing",
            theaterManagerId: manager1._id,
        },
        {
            movieName: "The Batman",
            description:
                "Năm thứ hai của Batman, Bruce Wayne truy lùng một kẻ giết người hàng loạt để lại những câu đố bí ẩn nhắm vào tầng lớp thượng lưu Gotham City.",
            genres: ["Hành động", "Tội phạm", "Bí ẩn"],
            duration: 176,
            releaseDate: new Date("2024-02-15"),
            poster: "https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_.jpg",
            ageRating: "T16",
            status: "ongoing",
            theaterManagerId: manager2._id,
        },
        {
            movieName: "Avatar: The Way of Water",
            description:
                "Jake Sully và gia đình phải rời bỏ quê hương khi một mối đe dọa quen thuộc quay trở lại, buộc họ khám phá những vùng đất mới của Pandora.",
            genres: ["Khoa học viễn tưởng", "Phiêu lưu", "Hành động"],
            duration: 192,
            releaseDate: new Date("2024-03-01"),
            poster: "https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_.jpg",
            ageRating: "K",
            status: "ongoing",
            theaterManagerId: manager1._id,
        },
        {
            movieName: "Top Gun: Maverick",
            description:
                "Sau 30 năm phục vụ, Pete Maverick vẫn là phi công xuất sắc nhất Hải quân. Anh được giao nhiệm vụ huấn luyện một nhóm phi công tinh nhuệ cho một sứ mệnh nguy hiểm.",
            genres: ["Hành động", "Kịch tính"],
            duration: 131,
            releaseDate: new Date("2024-03-15"),
            poster: "https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_.jpg",
            ageRating: "K",
            status: "ongoing",
            theaterManagerId: manager2._id,
        },
        // Sắp chiếu
        {
            movieName: "Guardians of the Galaxy Vol. 3",
            description:
                "Vẫn đang hồi phục, Peter Quill tập hợp Guardians cho một nhiệm vụ quan trọng có thể đánh dấu sự kết thúc của đội nếu không thành công.",
            genres: ["Hành động", "Phiêu lưu", "Hài hước"],
            duration: 150,
            releaseDate: new Date("2025-06-15"),
            poster: "https://m.media-amazon.com/images/M/MV5BMDgxOTdjMWctMGE2Ni00NGQwLWExMGMtMzBiZTdjOGM3OTMzXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
            ageRating: "T13",
            status: "coming-soon",
            theaterManagerId: manager1._id,
        },
        {
            movieName: "The Marvels",
            description:
                "Carol Danvers, Kamala Khan và Monica Rambeau phải hợp tác khi quyền năng của họ bị hoán đổi mỗi khi sử dụng, tạo ra những tình huống hỗn loạn.",
            genres: ["Hành động", "Khoa học viễn tưởng", "Phiêu lưu"],
            duration: 105,
            releaseDate: new Date("2025-07-20"),
            poster: "https://m.media-amazon.com/images/M/MV5BM2U3YjQxNTAtYzNhZi00NWZkLTlhN2ItYjNkYmMxOTYxYzkxXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
            ageRating: "K",
            status: "coming-soon",
            theaterManagerId: manager2._id,
        },
        {
            movieName: "Aquaman and the Lost Kingdom",
            description:
                "Arthur Curry phải rèn giũa một liên minh bất ngờ để bảo vệ Atlantis và cả thế giới trước một thế lực cổ xưa đang trỗi dậy.",
            genres: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
            duration: 124,
            releaseDate: new Date("2025-08-10"),
            poster: "https://m.media-amazon.com/images/M/MV5BYTJkNGQyZGItZmVhMy00MDU4LWE4NTQtMjVmNzQ1YzU1YWY2XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
            ageRating: "T13",
            status: "coming-soon",
            theaterManagerId: manager1._id,
        },
    ];

    const movies = await Movie.insertMany(moviesData);
    const ongoingMovies = movies.filter((m) => m.status === "ongoing");
    console.log(`🎬 Created ${movies.length} movies (${ongoingMovies.length} ongoing, ${movies.length - ongoingMovies.length} coming-soon)`);

    // ── ROOMS ─────────────────────────────────────────────────────────────────
    const roomsData = [];
    for (const theater of [th1, th2, th3, th4]) {
        roomsData.push(
            { theaterId: theater._id, roomNumber: "Phòng 1" },
            { theaterId: theater._id, roomNumber: "Phòng 2" }
        );
    }
    const rooms = await Room.insertMany(roomsData);
    console.log(`🏠 Created ${rooms.length} rooms`);

    // ── SEATS ─────────────────────────────────────────────────────────────────
    const seatsData = [];
    for (const room of rooms) {
        for (const row of SEAT_ROWS) {
            for (let col = 1; col <= SEAT_COLS; col++) {
                const seatType = VIP_ROWS.includes(row) ? "vip" : "standard";
                seatsData.push({
                    roomId: room._id,
                    seatNumber: `${row}${col}`,
                    seatType,
                });
            }
        }
    }
    const seats = await Seat.insertMany(seatsData);
    console.log(`💺 Created ${seats.length} seats (${SEAT_ROWS.length * SEAT_COLS} per room)`);

    // ── SHOWS ─────────────────────────────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const theaterList = [th1, th2, th3, th4];

    const showsData = [];
    for (const movie of ongoingMovies) {
        for (const theater of theaterList) {
            const room = rooms.find(
                (r) => r.theaterId.toString() === theater._id.toString()
            );
            if (!room) continue;

            for (let day = 0; day < 5; day++) {
                const times = buildShowTimes(today, movie.duration, day);
                for (const { startTime, endTime } of times) {
                    showsData.push({
                        movieId: movie._id,
                        theaterId: theater._id,
                        roomId: room._id,
                        startTime,
                        endTime,
                        price: 90000,
                        status: "planned",
                    });
                }
            }
        }
    }
    const shows = await Show.insertMany(showsData);
    console.log(`🎥 Created ${shows.length} shows`);

    // ── BOOKINGS & TICKETS ────────────────────────────────────────────────────
    const show1 = shows[0];
    const show1Seats = seats.filter(
        (s) => s.roomId.toString() === show1.roomId.toString()
    );

    // Customer 1 đặt 2 vé (A1, A2) cho show đầu tiên
    const [t1, t2] = await Ticket.insertMany([
        { showId: show1._id, ownerId: customer1._id, seatId: show1Seats[0]._id, price: SEAT_PRICE.standard },
        { showId: show1._id, ownerId: customer1._id, seatId: show1Seats[1]._id, price: SEAT_PRICE.standard },
    ]);
    const booking1 = await Booking.create({
        userId: customer1._id,
        showId: show1._id,
        tickets: [t1._id, t2._id],
        totalPrice: t1.price + t2.price,
        status: "paid",
    });
    await Ticket.updateMany(
        { _id: { $in: [t1._id, t2._id] } },
        { bookingId: booking1._id }
    );

    // Customer 2 đặt 1 vé VIP cho show thứ 4
    const show2 = shows[3];
    const show2VipSeats = seats.filter(
        (s) =>
            s.roomId.toString() === show2.roomId.toString() &&
            s.seatType === "vip"
    );
    const [t3] = await Ticket.insertMany([
        { showId: show2._id, ownerId: customer2._id, seatId: show2VipSeats[0]._id, price: SEAT_PRICE.vip },
    ]);
    const booking2 = await Booking.create({
        userId: customer2._id,
        showId: show2._id,
        tickets: [t3._id],
        totalPrice: t3.price,
        status: "pending",
    });
    await Ticket.updateOne({ _id: t3._id }, { bookingId: booking2._id });

    // Customer 3 đặt 3 vé cho show thứ 7
    const show3 = shows[6];
    const show3Seats = seats.filter(
        (s) => s.roomId.toString() === show3.roomId.toString()
    );
    const [t4, t5, t6] = await Ticket.insertMany([
        { showId: show3._id, ownerId: customer3._id, seatId: show3Seats[4]._id, price: SEAT_PRICE.standard },
        { showId: show3._id, ownerId: customer3._id, seatId: show3Seats[5]._id, price: SEAT_PRICE.standard },
        { showId: show3._id, ownerId: customer3._id, seatId: show3Seats[6]._id, price: SEAT_PRICE.standard },
    ]);
    const booking3 = await Booking.create({
        userId: customer3._id,
        showId: show3._id,
        tickets: [t4._id, t5._id, t6._id],
        totalPrice: t4.price + t5.price + t6.price,
        status: "paid",
    });
    await Ticket.updateMany(
        { _id: { $in: [t4._id, t5._id, t6._id] } },
        { bookingId: booking3._id }
    );

    console.log("🎫 Created 3 bookings & 6 tickets");

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    const [m0, m1, m2, m3, m4] = ongoingMovies;
    await Review.insertMany([
        { userId: customer1._id, movieId: m0._id, rating: 9, comment: "Bộ phim tuyệt vời! Cảnh chiến đấu cuối cùng rất hoành tráng và đầy cảm xúc." },
        { userId: customer2._id, movieId: m0._id, rating: 8, comment: "Kịch bản chặt chẽ, diễn xuất xuất sắc. Xem lần 3 vẫn xúc động." },
        { userId: customer3._id, movieId: m0._id, rating: 10, comment: "Masterpiece! Đỉnh cao của Marvel. Không có gì để chê." },
        { userId: customer1._id, movieId: m1._id, rating: 9, comment: "Bất ngờ từ đầu đến cuối. Fan Marvel phải xem!" },
        { userId: customer2._id, movieId: m1._id, rating: 8, comment: "Hội tụ quá nhiều nhân vật nhưng vẫn rất hay và cảm xúc." },
        { userId: customer3._id, movieId: m2._id, rating: 8, comment: "The Batman rất tối và căng thẳng. Robert Pattinson xuất sắc." },
        { userId: customer1._id, movieId: m3._id, rating: 9, comment: "Hình ảnh đẹp mãn nhãn, thế giới Pandora sống động đến từng chi tiết." },
        { userId: customer2._id, movieId: m4._id, rating: 9, comment: "Cảnh bay đẹp mãn nhãn. Tom Cruise liều lĩnh thật sự ngoài đời." },
    ]);
    console.log("⭐ Created 8 reviews");

    // ── SUMMARY ───────────────────────────────────────────────────────────────
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅  Seed hoàn tất!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 Tài khoản test:");
    console.log("  Role          Email                    Password");
    console.log("  ──────────────────────────────────────────────────");
    console.log("  Admin         admin@cinebook.com        Admin123@");
    console.log("  Manager (CGV) manager1@cinebook.com     Manager123@");
    console.log("  Manager (LT)  manager2@cinebook.com     Manager123@");
    console.log("  Customer 1    customer1@cinebook.com    Customer123@");
    console.log("  Customer 2    customer2@cinebook.com    Customer123@");
    console.log("  Customer 3    customer3@cinebook.com    Customer123@");
    console.log("\n📊 Dữ liệu đã tạo:");
    console.log(`  Users: 6 | Theater Systems: 2 | Theaters: 4`);
    console.log(`  Movies: ${movies.length} | Rooms: ${rooms.length} | Seats: ${seats.length}`);
    console.log(`  Shows: ${shows.length} | Bookings: 3 | Tickets: 6 | Reviews: 8`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed thất bại:", err.message);
    process.exit(1);
});
