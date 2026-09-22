from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.college import College, Department
from app.models.user import User
from app.models.portfolio import Badge, Project
from app.models.post import Post, Comment, PostLike
from app.models.message import Message

def seed_initial_data(db: Session):
    """Seed the database with default colleges, demo users, posts and messages if empty."""
    # Check if already seeded
    if db.query(College).first():
        return

    print("[*] Seeding database with initial academic and demo records...")

    # 1. Colleges
    colleges = [
        College(id="ciitm", name="CIITM Institute of Technology"),
        College(id="rtu", name="Rajasthan Technical University"),
        College(id="iitd", name="IIT Delhi")
    ]
    db.add_all(colleges)
    db.commit()

    # 2. Departments
    departments = [
        Department(
            name="Computer Science",
            college="CIITM Institute of Technology",
            head="Prof. Sharma",
            total_faculty=12,
            total_students=450
        ),
        Department(
            name="Cybersecurity",
            college="CIITM Institute of Technology",
            head="Pending",
            total_faculty=4,
            total_students=120
        ),
        Department(
            name="Mechanical",
            college="Rajasthan Technical University",
            head="Dr. Gupta",
            total_faculty=8,
            total_students=310
        )
    ]
    db.add_all(departments)
    db.commit()

    # 3. Users
    u1 = User(
        id="u1",
        email="student@ciitm.org",
        password="password123",
        name="Gaurav Kumar",
        role="student",
        college="CIITM Institute of Technology",
        department="Computer Science",
        bio="Cybersecurity enthusiast exploring SOC, VAPT, and Blue Team ops.",
        is_approved=True,
        credits=45
    )
    u2 = User(
        id="u2",
        email="faculty@ciitm.org",
        password="password123",
        name="Prof. Sharma",
        role="faculty",
        college="CIITM Institute of Technology",
        department="Computer Science",
        bio="Senior Professor in Computer Science & Cyber Security.",
        is_approved=True,
        credits=0
    )
    u3 = User(
        id="u3",
        email="alumni@ciitm.org",
        password="password123",
        name="Claire Jenkins",
        role="alumni",
        college="CIITM Institute of Technology",
        department="Computer Science",
        company="CyberShield Tech",
        job_title="Senior Security Analyst",
        bio="Alumni 2022 batch. Hiring talent for SOC Analyst roles.",
        is_approved=True,
        credits=0
    )
    u3_alias = User(
        id="u3_alias",
        email="alumni@gmail.com",
        password="password123",
        name="Claire Jenkins (Personal)",
        role="alumni",
        college="CIITM Institute of Technology",
        department="Computer Science",
        company="CyberShield Tech",
        job_title="Senior Security Analyst",
        bio="Alumni 2022 batch. Hiring talent for SOC Analyst roles.",
        is_approved=True,
        credits=0
    )
    u4 = User(
        id="u4",
        email="admin@ciitm.org",
        password="password123",
        name="CIITM Admin",
        role="college_admin",
        college="CIITM Institute of Technology",
        department="Administration",
        bio="Official Admin Dashboard for CIITM.",
        is_approved=True,
        credits=0
    )
    u5 = User(
        id="u5",
        email="new_faculty@ciitm.org",
        password="password123",
        name="Dr. Verma",
        role="faculty",
        college="CIITM Institute of Technology",
        department="Cybersecurity",
        bio="Specialist in Artificial Intelligence & Cryptography.",
        is_approved=False,
        credits=0
    )
    u6 = User(
        id="u6",
        email="priya@rtu.edu",
        password="password123",
        name="Priya Sharma",
        role="student",
        college="Rajasthan Technical University",
        department="Mechanical",
        bio="Robotics developer and IoT builder.",
        is_approved=True,
        credits=30
    )
    db.add_all([u1, u2, u3, u3_alias, u4, u5, u6])
    db.commit()

    # 4. Badges & Projects for Students
    b1 = Badge(user_id="u1", name="VAPT Expert", issuer="Prof. Sharma", date="Aug 2026")
    b2 = Badge(user_id="u1", name="Code Ninja", issuer="CIITM Admin", date="Sep 2026")
    b3 = Badge(user_id="u6", name="Robotics Master", issuer="Dr. Verma", date="Jul 2026")

    p1 = Project(id="p1", user_id="u1", title="Encrypted Password Manager", tech="Python, SQLite", description="AES-256 encrypted local vault.")
    p2 = Project(id="p2", user_id="u1", title="WhatsApp Edu-Organizer", tech="React Native, Node.js", description="Academic scheduler integration.")
    p3 = Project(id="p3", user_id="u6", title="Autonomous Rover", tech="Arduino, C++", description="Obstacle avoiding rover.")

    db.add_all([b1, b2, b3, p1, p2, p3])
    db.commit()

    # 5. Posts
    now = datetime.utcnow()
    post_1 = Post(
        id="post_1",
        author_id="u1",
        author_name="Gaurav Kumar",
        author_role="student",
        author_college="CIITM Institute of Technology",
        content="Completed my new cybersecurity project on VAPT! Check out my encrypted vault implementation.",
        post_type="project",
        timestamp="2 hours ago",
        created_at=now - timedelta(hours=2)
    )
    post_2 = Post(
        id="post_2",
        author_id="u3",
        author_name="Claire Jenkins",
        author_role="alumni",
        author_college="CIITM Institute of Technology",
        content="We are hiring freshers for the SOC Analyst role at CyberShield Tech. Reach out or message me directly!",
        post_type="job",
        timestamp="5 hours ago",
        created_at=now - timedelta(hours=5)
    )
    post_3 = Post(
        id="post_3",
        author_id="u6",
        author_name="Priya Sharma",
        author_role="student",
        author_college="Rajasthan Technical University",
        content="Excited to demonstrate our Autonomous Rover at the upcoming Tech Expo!",
        post_type="update",
        timestamp="1 day ago",
        created_at=now - timedelta(days=1)
    )
    db.add_all([post_1, post_2, post_3])
    db.commit()

    # Likes & Comments
    db.add_all([
        PostLike(post_id="post_1", user_id="u2"),
        PostLike(post_id="post_1", user_id="u3"),
        PostLike(post_id="post_2", user_id="u1"),
        PostLike(post_id="post_2", user_id="u6"),
        PostLike(post_id="post_3", user_id="u1"),
        Comment(id="c1", post_id="post_1", author_name="Prof. Sharma", content="Impressive technical work! Submit for credits evaluation."),
        Comment(id="c2", post_id="post_2", author_name="Gaurav Kumar", content="Interested! Sent you a connection message.")
    ])
    db.commit()

    # 6. Messages
    m1 = Message(
        id="m1",
        sender_id="u1",
        sender_name="Gaurav Kumar",
        receiver_id="u3",
        receiver_name="Claire Jenkins",
        content="Hi Claire, I saw your post regarding the SOC Analyst role!",
        timestamp="10:30 AM",
        created_at=now - timedelta(minutes=45)
    )
    m2 = Message(
        id="m2",
        sender_id="u3",
        sender_name="Claire Jenkins",
        receiver_id="u1",
        receiver_name="Gaurav Kumar",
        content="Hey Gaurav! Checked your VAPT project on your profile. Looks great. Let's schedule a call.",
        timestamp="10:45 AM",
        created_at=now - timedelta(minutes=30)
    )
    db.add_all([m1, m2])
    db.commit()

    print("[✓] Initial database seeding completed successfully.")
