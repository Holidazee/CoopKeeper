# 🐔 CoopKeeper CLI

A practical **C++ console application** for managing your chicken coop operations — track egg production, feed usage, expenses, health notes, and cleaning records with persistent storage and CSV export.

---

## 🚀 Features

* 📊 **Startup Dashboard**

  * Total eggs collected
  * Monthly production summary
  * Cost per dozen (current month)
  * Last cleaning date

* 🥚 **Egg Tracking**

  * Add, edit, delete records
  * Automatically sorted by date
  * Notes for production trends

* 🌾 **Feed Tracking**

  * Log feed purchases
  * Track total feed cost

* 💸 **Expense Tracking**

  * Categorized expense logging
  * Summary by category

* 🏥 **Health Notes**

  * Track issues, treatments, observations

* 🧹 **Cleaning Records**

  * Log coop cleanings
  * View last cleaning date on dashboard

* 📁 **Persistent Storage**

  * Data saved in `.txt` files
  * Automatically loaded at startup

* 📤 **CSV Export**

  * Export records for Excel or analysis

---

## 🛠️ Tech Stack

* C++
* Object-Oriented Design (OOP)
* File I/O (`.txt` persistence)
* CSV export functionality
* ANSI terminal styling (enhanced CLI UI)

---

## 📂 Project Structure

```
CoopKeeper-CLI/
├── data/              # Persistent text data files
├── exports/           # CSV export output
├── include/           # Header files (.h)
├── src/               # Source files (.cpp)
├── screenshots/       # App screenshots
├── CoopKeeper.sln     # Visual Studio solution
├── CoopKeeper.vcxproj # Visual Studio project
├── README.md
└── LICENSE.txt
```

---

## 📸 Screenshots

### Dashboard

![Dashboard](screenshots/Dashboard.png)

### Egg Records

![Egg Records](screenshots/EggRecords.png)

### Add Egg Entry

![Add Egg](screenshots/addegg.png)

### CSV Export Confirmation

![CSV Export](screenshots/csvconfirm.png)

---

## ⚙️ Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/Holidazee/CoopKeeper-CLI.git
cd CoopKeeper-CLI
```

### 2. Open in Visual Studio

* Open `CoopKeeper.sln`
* Build and run (`Ctrl + F5`)

### 3. Important (Visual Studio users)

For file persistence to work correctly:

Ensure these folders exist in your build directory:

```
x64/Debug/data/
x64/Debug/exports/
```

> These are required for reading/writing `.txt` files and exporting CSVs.

---

## 📊 Example Data Files

Located in `/data/`:

* `chickens.txt`
* `egg_records.txt`
* `feed_records.txt`
* `expenses.txt`
* `health_notes.txt`
* `cleaning_records.txt`

---

## ✨ Highlights

* Clean modular design using multiple classes
* Real-world use case (homestead / backyard farming)
* Strong CLI UX with styled output
* Practical data tracking + reporting
* Resume-ready C++ project

---

## 🔮 Future Improvements

* Monthly/yearly analytics reports
* Cost trends visualization
* Configurable file paths (remove Debug dependency)
* Cross-platform support (Linux/Mac)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built by **Taylor Burris**

---

## ⭐ If you like this project

Give it a star on GitHub — it helps a lot!
