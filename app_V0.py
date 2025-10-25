from flask import Flask, render_template, request, redirect, url_for, flash
import csv
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-change-me")

ORDERS_CSV = "orders.csv"  # Bestellungen werden hier gespeichert

@app.get("/")
def home():
    return render_template("index.html", title="Imkerei – Honig aus der Region")

@app.post("/order")
def order():
    # sehr einfache Validierung
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    jars = request.form.get("jars", "").strip()
    message = request.form.get("message", "").strip()

    errors = []
    if not name: errors.append("Bitte Namen angeben.")
    if not email or "@" not in email: errors.append("Bitte gültige E-Mail angeben.")
    try:
        j = int(jars)
        if j < 1 or j > 100: errors.append("Anzahl Gläser: 1–100.")
    except:
        errors.append("Anzahl Gläser muss eine Zahl sein.")

    if errors:
        for e in errors:
            flash(e, "error")
        return redirect(url_for("home") + "#order")

    # speichern (CSV)
    new_file = not os.path.exists(ORDERS_CSV)
    with open(ORDERS_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if new_file:
            writer.writerow(["name", "email", "jars", "message"])
        writer.writerow([name, email, jars, message])

    flash("Danke! Deine Bestellung ist eingegangen. Wir melden uns per E-Mail. 🐝", "success")
    return redirect(url_for("home") + "#order")

if __name__ == "__main__":
    app.run(debug=True)  # http://127.0.0.1:5000