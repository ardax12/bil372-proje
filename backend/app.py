from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
from datetime import datetime
import secrets

app = Flask(__name__)
CORS(app)

DATABASE = '..\\Default.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def dict_from_row(row):
    return dict(row) if row else None


@app.route('/api/flights', methods=['GET'])
def get_flights():
    """Uçuşları listele"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            u.ucus_no as id,
            u.ucus_adi as code,
            u.ucus_tarihi as date,
            u.kalkis_saati as time,
            u.ucus_suresi as duration,
            u.ucak_id,
            u.pilot_id,
            u.kalkis_id,
            u.varis_id,
            k.havaalani_sehir as from_city,
            k.havaalani_kodu as from_code,
            v.havaalani_sehir as to_city,
            v.havaalani_kodu as to_code,
            uc.ucak_modeli as aircraft_model,
            uc.ucak_kuyrukkodu as aircraft_code,
            p.pilot_ad as pilot_name
        FROM ucus_bilgileri u
        LEFT JOIN havaalani_bilgileri k ON u.kalkis_id = k.havaalani_id
        LEFT JOIN havaalani_bilgileri v ON u.varis_id = v.havaalani_id
        LEFT JOIN ucak_bilgileri uc ON u.ucak_id = uc.ucak_id
        LEFT JOIN pilot_bilgileri p ON u.pilot_id = p.pilot_id
        ORDER BY u.ucus_tarihi DESC, u.kalkis_saati DESC
    ''')
    flights = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(flights)

@app.route('/api/flights/<int:flight_id>', methods=['GET'])
def get_flight(flight_id):
    """Tek uçuş getir"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            u.ucus_no as id,
            u.ucus_adi as code,
            u.ucus_tarihi as date,
            u.kalkis_saati as time,
            u.ucus_suresi as duration,
            u.ucak_id,
            u.pilot_id,
            u.kalkis_id,
            u.varis_id,
            k.havaalani_sehir as from_city,
            v.havaalani_sehir as to_city
        FROM ucus_bilgileri u
        LEFT JOIN havaalani_bilgileri k ON u.kalkis_id = k.havaalani_id
        LEFT JOIN havaalani_bilgileri v ON u.varis_id = v.havaalani_id
        WHERE u.ucus_no = ?
    ''', (flight_id,))
    flight = dict_from_row(cursor.fetchone())
    conn.close()
    return jsonify(flight) if flight else ('Flight not found', 404)

@app.route('/api/flights', methods=['POST'])
def add_flight():
    """Uçuş ekle"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO ucus_bilgileri (ucus_adi, kalkis_id, varis_id, ucak_id, pilot_id, ucus_suresi, ucus_tarihi, kalkis_saati)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['code'],
        data['kalkis_id'],
        data['varis_id'],
        data['ucak_id'],
        data['pilot_id'],
        data['duration'],
        data['date'],
        data['time']
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': new_id, 'message': 'Uçuş başarıyla eklendi'}), 201

@app.route('/api/flights/<int:flight_id>', methods=['PUT'])
def update_flight(flight_id):
    """Uçuş güncelle"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE ucus_bilgileri 
        SET ucus_adi = ?, kalkis_id = ?, varis_id = ?, ucak_id = ?, pilot_id = ?, ucus_suresi = ?, ucus_tarihi = ?, kalkis_saati = ?
        WHERE ucus_no = ?
    ''', (
        data['code'],
        data['kalkis_id'],
        data['varis_id'],
        data['ucak_id'],
        data['pilot_id'],
        data['duration'],
        data['date'],
        data['time'],
        flight_id
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Uçuş başarıyla güncellendi'})

@app.route('/api/flights/<int:flight_id>', methods=['DELETE'])
def delete_flight(flight_id):
    """Uçuş sil"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM ucus_bilgileri WHERE ucus_no = ?', (flight_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Uçuş başarıyla silindi'})

@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user against login table"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM login WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        # Create a session token
        session_token = secrets.token_hex(32)
        return jsonify({
            'success': True,
            'token': session_token,
            'username': username
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout user"""
    return jsonify({'success': True}), 200

@app.route('/api/passengers', methods=['GET'])
def get_passengers():
    """Yolcuları listele"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            y.yolcu_id as id,
            y.yolcu_adi as name,
            y.tc_no,
            y.email,
            y.telefon_numarasi as phone,
            y.yolcu_cinsiyeti as gender,
            y.yolcu_yasi as age,
            (SELECT COUNT(*) FROM bilet_bilgileri WHERE yolcu_id = y.yolcu_id) as reservations
        FROM yolcu_bilgileri y
        ORDER BY y.yolcu_adi
    ''')
    passengers = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(passengers)

@app.route('/api/passengers/<int:passenger_id>', methods=['GET'])
def get_passenger(passenger_id):
    """Tek yolcu getir"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM yolcu_bilgileri WHERE yolcu_id = ?', (passenger_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({
            'id': row['yolcu_id'],
            'name': row['yolcu_adi'],
            'tc_no': row['tc_no'],
            'email': row['email'],
            'phone': row['telefon_numarasi'],
            'gender': row['yolcu_cinsiyeti'],
            'age': row['yolcu_yasi']
        })
    return ('Passenger not found', 404)

@app.route('/api/passengers', methods=['POST'])
def add_passenger():
    """Yolcu ekle"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO yolcu_bilgileri (yolcu_adi, tc_no, email, telefon_numarasi, yolcu_cinsiyeti, yolcu_yasi)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['name'],
        data['tc_no'],
        data['email'],
        data['phone'],
        data['gender'],
        data['age']
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': new_id, 'message': 'Yolcu başarıyla eklendi'}), 201

@app.route('/api/passengers/<int:passenger_id>', methods=['PUT'])
def update_passenger(passenger_id):
    """Yolcu güncelle"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE yolcu_bilgileri 
        SET yolcu_adi = ?, tc_no = ?, email = ?, telefon_numarasi = ?, yolcu_cinsiyeti = ?, yolcu_yasi = ?
        WHERE yolcu_id = ?
    ''', (
        data['name'],
        data['tc_no'],
        data['email'],
        data['phone'],
        data['gender'],
        data['age'],
        passenger_id
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Yolcu bilgileri başarıyla güncellendi'})

@app.route('/api/passengers/<int:passenger_id>', methods=['DELETE'])
def delete_passenger(passenger_id):
    """Yolcu sil"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM yolcu_bilgileri WHERE yolcu_id = ?', (passenger_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Yolcu başarıyla silindi'})

@app.route('/api/aircraft', methods=['GET'])
def get_aircraft():
    """Uçakları listele"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            ucak_id as id,
            ucak_modeli as model,
            ucak_kapasitesi as capacity,
            ucak_kuyrukkodu as code
        FROM ucak_bilgileri
        ORDER BY ucak_modeli
    ''')
    aircraft = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(aircraft)

@app.route('/api/aircraft/<int:aircraft_id>', methods=['GET'])
def get_aircraft_by_id(aircraft_id):
    """Tek uçak getir"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM ucak_bilgileri WHERE ucak_id = ?', (aircraft_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({
            'id': row['ucak_id'],
            'model': row['ucak_modeli'],
            'capacity': row['ucak_kapasitesi'],
            'code': row['ucak_kuyrukkodu']
        })
    return ('Aircraft not found', 404)

@app.route('/api/aircraft', methods=['POST'])
def add_aircraft():
    """Uçak ekle"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO ucak_bilgileri (ucak_modeli, ucak_kapasitesi, ucak_kuyrukkodu)
        VALUES (?, ?, ?)
    ''', (
        data['model'],
        data['capacity'],
        data['code']
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': new_id, 'message': 'Uçak başarıyla eklendi'}), 201

@app.route('/api/aircraft/<int:aircraft_id>', methods=['PUT'])
def update_aircraft(aircraft_id):
    """Uçak güncelle"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE ucak_bilgileri 
        SET ucak_modeli = ?, ucak_kapasitesi = ?, ucak_kuyrukkodu = ?
        WHERE ucak_id = ?
    ''', (
        data['model'],
        data['capacity'],
        data['code'],
        aircraft_id
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Uçak bilgileri başarıyla güncellendi'})

@app.route('/api/aircraft/<int:aircraft_id>', methods=['DELETE'])
def delete_aircraft(aircraft_id):
    """Uçak sil"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM ucak_bilgileri WHERE ucak_id = ?', (aircraft_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Uçak başarıyla silindi'})


@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    """Biletleri listele"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            b.bilet_id as id,
            b.ucus_id,
            b.yolcu_id,
            b.koltuk_no as seat,
            b.bilet_fiyati as price,
            b.alis_tarihi as purchase_date,
            y.yolcu_adi as passenger_name,
            u.ucus_adi as flight_code,
            CASE 
                WHEN o.odeme_id IS NOT NULL THEN 'Ödendi'
                ELSE 'Beklemede'
            END as status
        FROM bilet_bilgileri b
        LEFT JOIN yolcu_bilgileri y ON b.yolcu_id = y.yolcu_id
        LEFT JOIN ucus_bilgileri u ON b.ucus_id = u.ucus_no
        LEFT JOIN odeme_bilgileri o ON b.bilet_id = o.bilet_id
        ORDER BY b.alis_tarihi DESC
    ''')
    tickets = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(tickets)

@app.route('/api/tickets', methods=['POST'])
def add_ticket():
    """Bilet satın al (Rezervasyon yap)"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    price = data.get('price', 1000)
    
    cursor.execute('''
        INSERT INTO bilet_bilgileri (ucus_id, yolcu_id, koltuk_no, bilet_fiyati, alis_tarihi)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data['ucus_id'],
        data['yolcu_id'],
        data['seat'],
        price,
        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': new_id, 'message': 'Bilet başarıyla oluşturuldu'}), 201

@app.route('/api/tickets/<int:ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    """Bilet sil (Rezervasyon iptal)"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM odeme_bilgileri WHERE bilet_id = ?', (ticket_id,))
    cursor.execute('DELETE FROM bilet_bilgileri WHERE bilet_id = ?', (ticket_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Bilet başarıyla iptal edildi'})


@app.route('/api/payments', methods=['GET'])
def get_payments():
    """Ödemeleri listele"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            o.odeme_id as id,
            o.bilet_id,
            o.odeme_yontemi as method,
            o.odeme_miktari as amount,
            o.odeme_tarihi as payment_date,
            y.yolcu_adi as passenger_name,
            u.ucus_adi as flight_code
        FROM odeme_bilgileri o
        LEFT JOIN bilet_bilgileri b ON o.bilet_id = b.bilet_id
        LEFT JOIN yolcu_bilgileri y ON b.yolcu_id = y.yolcu_id
        LEFT JOIN ucus_bilgileri u ON b.ucus_id = u.ucus_no
        ORDER BY o.odeme_tarihi DESC
    ''')
    payments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(payments)

@app.route('/api/payments', methods=['POST'])
def add_payment():
    """Ödeme yap"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT bilet_fiyati FROM bilet_bilgileri WHERE bilet_id = ?', (data['bilet_id'],))
    ticket = cursor.fetchone()
    if not ticket:
        conn.close()
        return ('Ticket not found', 404)
    
    cursor.execute('''
        INSERT INTO odeme_bilgileri (bilet_id, odeme_yontemi, odeme_miktari, odeme_tarihi)
        VALUES (?, ?, ?, ?)
    ''', (
        data['bilet_id'],
        data['method'],
        ticket['bilet_fiyati'],
        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': new_id, 'message': 'Ödeme başarıyla alındı'}), 201

@app.route('/api/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    """Ödeme iade et"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM odeme_bilgileri WHERE odeme_id = ?', (payment_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Ödeme başarıyla iade edildi'})


@app.route('/api/airports', methods=['GET'])
def get_airports():
    """Havaalanlarını listele"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            havaalani_id as id,
            havaalani_adi as name,
            havaalani_sehir as city,
            havaalani_ulke as country,
            havaalani_kodu as code
        FROM havaalani_bilgileri
        ORDER BY havaalani_sehir
    ''')
    airports = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(airports)


@app.route('/api/pilots', methods=['GET'])
def get_pilots():
    """Pilotları listele"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            pilot_id as id,
            pilot_ad as name,
            pilot_rol as role
        FROM pilot_bilgileri
        ORDER BY pilot_ad
    ''')
    pilots = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(pilots)


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Dashboard istatistikleri"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as count FROM ucus_bilgileri')
    total_flights = cursor.fetchone()['count']
    
    cursor.execute('SELECT COUNT(*) as count FROM yolcu_bilgileri')
    total_passengers = cursor.fetchone()['count']
    
    cursor.execute('SELECT COUNT(*) as count FROM ucak_bilgileri')
    total_aircraft = cursor.fetchone()['count']
    
    cursor.execute('SELECT COUNT(*) as count FROM bilet_bilgileri')
    total_tickets = cursor.fetchone()['count']
    
    cursor.execute('SELECT COALESCE(SUM(odeme_miktari), 0) as total FROM odeme_bilgileri')
    total_revenue = cursor.fetchone()['total']
    
    cursor.execute('SELECT COUNT(*) as count FROM odeme_bilgileri')
    paid_tickets = cursor.fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'totalFlights': total_flights,
        'totalPassengers': total_passengers,
        'totalAircraft': total_aircraft,
        'totalTickets': total_tickets,
        'totalRevenue': total_revenue,
        'paidTickets': paid_tickets,
        'refundedTickets': 0  
    })


@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    """Get all reservations (tickets with passenger and flight info)"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            b.bilet_id as id,
            b.ucus_id,
            b.yolcu_id,
            b.koltuk_no as seat,
            b.bilet_fiyati as price,
            b.alis_tarihi as date,
            y.yolcu_adi as passenger_name,
            u.ucus_adi as flight_code,
            u.ucus_tarihi as flight_date,
            u.kalkis_saati as flight_time,
            k.havaalani_sehir as from_city,
            v.havaalani_sehir as to_city,
            CASE 
                WHEN o.odeme_id IS NOT NULL THEN 'Ödendi'
                ELSE 'Beklemede'
            END as status
        FROM bilet_bilgileri b
        LEFT JOIN yolcu_bilgileri y ON b.yolcu_id = y.yolcu_id
        LEFT JOIN ucus_bilgileri u ON b.ucus_id = u.ucus_no
        LEFT JOIN havaalani_bilgileri k ON u.kalkis_id = k.havaalani_id
        LEFT JOIN havaalani_bilgileri v ON u.varis_id = v.havaalani_id
        LEFT JOIN odeme_bilgileri o ON b.bilet_id = o.bilet_id
        ORDER BY b.alis_tarihi DESC
    ''')
    reservations = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(reservations)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
