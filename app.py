from flask import Flask, render_template, request, redirect, url_for, flash
import os

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-change-me")

@app.get("/")
def home():
    hero_url = url_for("static", filename="img/hero.jpg")
    return render_template("index.html", title="Honig vom Imker", hero_url=hero_url)

@app.post("/order")
def order():
    required = ["name", "email", "address", "product", "quantity"]
    missing = [f for f in required if not request.form.get(f, "").strip()]
    if missing:
        flash("Bitte alle Pflichtfelder ausfüllen.", "error")
        return redirect(url_for("home") + "#order")

    name = request.form.get("name").strip()
    product = request.form.get("product").strip()
    qty = request.form.get("quantity").strip()
    message = request.form.get("message", "").strip()

    # ✨ NEU: diese Zeile schreibt in die Render-Logs
    print("Bestellung gespeichert:", name, email, product, qty)

    flash(f"Danke, {name}! Deine Bestellung ({qty}× {product}) ist eingegangen. 🐝", "success")
    return redirect(url_for("home") + "#order")

if __name__ == "__main__":
    app.run(debug=True)