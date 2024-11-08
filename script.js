class Room {
  constructor(number, capacity) {
    this.number = number;
    this.capacity = capacity;
    this.reservations = [];
  }

  isAvailable(startTime, duration, date) {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    for (let reservation of this.reservations) {
      const resStart = new Date(`${reservation.date}T${reservation.startTime}`);
      const resEnd = new Date(
        resStart.getTime() + reservation.duration * 60 * 60 * 1000
      );
      if (start < resEnd && end > resStart) {
        return false; // Ada konflik
      }
    }
    return true; // Tidak ada konflik
  }

  addReservation(reservation) {
    this.reservations.push(reservation);
  }

  // Fungsi untuk membatalkan reservasi
  cancelReservation(reservation) {
    this.capacity += reservation.numGuests;
    this.reservations = this.reservations.filter((res) => res !== reservation);
  }
}

class Reservation {
  constructor(
    name,
    roomNumber,
    date,
    startTime,
    duration,
    numGuests,
    roomCapacity
  ) {
    this.name = name;
    this.roomNumber = roomNumber;
    this.date = date;
    this.startTime = startTime;
    this.duration = duration;
    this.numGuests = numGuests;
    this.roomCapacity = roomCapacity; // Menyimpan kapasitas awal ruangan
  }
}

// Data ruangan
const rooms = [
  new Room(101, 10),
  new Room(102, 5),
  new Room(103, 3),
  new Room(104, 7),
  new Room(105, 9),
];

document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Mencegah form untuk dikirim

    const name = document.getElementById("name").value;
    const roomNumber = parseInt(document.getElementById("roomNumber").value);
    const reservationDate = document.getElementById("reservationDate").value;
    const startTime = document.getElementById("startTime").value;
    const duration = parseInt(document.getElementById("duration").value);
    const numGuests = parseInt(document.getElementById("numGuests").value); // Jumlah tamu

    const room = rooms.find((r) => r.number === roomNumber);

    // Pastikan kapasitas cukup
    if (
      room &&
      room.isAvailable(startTime, duration, reservationDate) &&
      room.capacity >= numGuests
    ) {
      const reservation = new Reservation(
        name,
        roomNumber,
        reservationDate,
        startTime,
        duration,
        numGuests,
        room.capacity // Simpan kapasitas awal ruangan
      );
      // Tambahkan setelah room.addReservation(reservation);
      room.addReservation(reservation);
      saveRoomsToLocalStorage();

      // Kurangi kapasitas ruangan sesuai dengan jumlah tamu
      room.capacity -= numGuests;

      // Menampilkan SweetAlert saat reservasi berhasil
      Swal.fire({
        title: "Reservasi Berhasil!",
        text: `Ruangan ${room.number} telah berhasil dipesan untuk ${numGuests} tamu.`,
        icon: "success",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3f51b5",
      });

      // Perbarui tampilan ruangan dan reservasi
      displayRooms();
      displayReservations();
    } else {
      Swal.fire({
        title: "Gagal!",
        text: "Ruangan tidak tersedia pada waktu yang dipilih atau kapasitas melebihi batas.",
        icon: "error",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#e53935",
      });
    }
  });

// Menampilkan daftar ruangan
function displayRooms() {
  const roomList = document
    .getElementById("roomList")
    .getElementsByTagName("tbody")[0];
  roomList.innerHTML = "";

  rooms.forEach((room) => {
    const row = roomList.insertRow();
    row.insertCell(0).innerText = room.number;
    row.insertCell(1).innerText = room.capacity;
    row.insertCell(2).innerText =
      room.reservations.length === 0 ? "Tersedia" : "Tidak Tersedia";
  });

  // Perbarui pilihan nomor kamar pada form
  updateRoomSelection();
}

// Menampilkan daftar reservasi dengan card-style
function displayReservations() {
  const reservationList = document.getElementById("reservationList");
  reservationList.innerHTML = ""; // Menghapus daftar lama

  rooms.forEach((room) => {
    room.reservations.forEach((reservation) => {
      const reservationCard = document.createElement("div");
      reservationCard.classList.add("reservation-card");

      // Informasi reservasi
      const reservationInfo = document.createElement("div");
      reservationInfo.classList.add("reservation-info");

      const name = document.createElement("p");
      name.innerText = `Nama: ${reservation.name}`;
      reservationInfo.appendChild(name);

      const roomNumber = document.createElement("p");
      roomNumber.innerText = `Ruangan: ${reservation.roomNumber}`;
      reservationInfo.appendChild(roomNumber);

      const date = document.createElement("p");
      date.innerText = `Tanggal: ${reservation.date}`;
      reservationInfo.appendChild(date);

      const startTime = document.createElement("p");
      startTime.innerText = `Waktu: ${reservation.startTime}`;
      reservationInfo.appendChild(startTime);

      const duration = document.createElement("p");
      duration.innerText = `Durasi: ${reservation.duration} jam`;
      reservationInfo.appendChild(duration);

      const numGuests = document.createElement("p");
      numGuests.innerText = `Jumlah Tamu: ${reservation.numGuests}`;
      reservationInfo.appendChild(numGuests);

      // Tombol untuk membatalkan reservasi
      const cancelButton = document.createElement("button");
      cancelButton.classList.add("reservation-button");
      cancelButton.innerText = "Batalkan";
      cancelButton.addEventListener("click", () =>
        cancelReservation(reservation)
      );

      reservationCard.appendChild(reservationInfo);
      reservationCard.appendChild(cancelButton);

      reservationList.appendChild(reservationCard);
    });
  });
}

// Fungsi untuk membatalkan reservasi dengan konfirmasi SweetAlert
function cancelReservation(reservation) {
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Anda akan membatalkan reservasi ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Batalkan",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#e53935",
    cancelButtonColor: "#3f51b5",
  }).then((result) => {
    if (result.isConfirmed) {
      const room = rooms.find((r) => r.number === reservation.roomNumber);
      if (room) {
        room.cancelReservation(reservation);
        saveRoomsToLocalStorage();

        Swal.fire({
          title: "Reservasi Dibatalkan!",
          text: "Reservasi Anda telah dibatalkan.",
          icon: "success",
          confirmButtonText: "Tutup",
          confirmButtonColor: "#3f51b5",
        });

        displayRooms();
        displayReservations();
      }
    }
  });
}

// Fungsi untuk memperbarui pilihan nomor kamar di dropdown
function updateRoomSelection() {
  const roomSelect = document.getElementById("roomNumber");
  roomSelect.innerHTML = ""; // Kosongkan pilihan yang ada

  rooms.forEach((room) => {
    if (room.capacity > 0) {
      const option = document.createElement("option");
      option.value = room.number;
      option.innerText = `Ruangan ${room.number} (Kapasitas: ${room.capacity})`;
      roomSelect.appendChild(option);
    }
  });
}

// Fungsi untuk menyimpan data ruangan ke Local Storage
function saveRoomsToLocalStorage() {
  const roomsData = rooms.map((room) => ({
    number: room.number,
    capacity: room.capacity,
    reservations: room.reservations,
  }));
  localStorage.setItem("rooms", JSON.stringify(roomsData));
}

// Fungsi untuk memuat data ruangan dari Local Storage
function loadRoomsFromLocalStorage() {
  const storedRooms = localStorage.getItem("rooms");
  if (storedRooms) {
    const roomsData = JSON.parse(storedRooms);
    roomsData.forEach((data) => {
      const room = rooms.find((r) => r.number === data.number);
      if (room) {
        room.capacity = data.capacity;
        room.reservations = data.reservations.map(
          (reservation) =>
            new Reservation(
              reservation.name,
              reservation.roomNumber,
              reservation.date,
              reservation.startTime,
              reservation.duration,
              reservation.numGuests,
              reservation.roomCapacity
            )
        );
      }
    });
  }
}

// Panggil loadRoomsFromLocalStorage sebelum inisialisasi tampilan
loadRoomsFromLocalStorage();
displayRooms();
displayReservations();
updateRoomSelection();

// Inisialisasi tampilan
displayRooms();
displayReservations();
updateRoomSelection();
