from datetime import datetime, timedelta

class SessionManager:
    def __init__(self, is_paid=False):
        self.is_paid = is_paid
        self.max_sessions = 50 if is_paid else 5
        self.sessions = {} # session_id -> start_time
        self.daily_counts = {} # date_str -> count
        self.active_sessions = set()

    def _get_today_str(self):
        return datetime.now().strftime("%Y-%m-%d")

    def can_start_session(self):
        today = self._get_today_str()
        count = self.daily_counts.get(today, 0)
        
        if count >= self.max_sessions:
            return False, "Daily session limit reached"
        
        return True, "OK"

    def start_session(self, session_id):
        today = self._get_today_str()
        self.active_sessions.add(session_id)
        self.sessions[session_id] = datetime.now()
        
        # Increment daily count
        current_count = self.daily_counts.get(today, 0)
        self.daily_counts[today] = current_count + 1

    def end_session(self, session_id):
        if session_id in self.active_sessions:
            self.active_sessions.remove(session_id)
        if session_id in self.sessions:
            del self.sessions[session_id]

    def get_status(self):
        today = self._get_today_str()
        used = self.daily_counts.get(today, 0)
        remaining = max(0, self.max_sessions - used)
        
        # Reset time is usually next midnight
        now = datetime.now()
        tomorrow = now + timedelta(days=1)
        reset_time = datetime(year=tomorrow.year, month=tomorrow.month, day=tomorrow.day)
        
        return {
            "sessions_used": used,
            "sessions_remaining": remaining,
            "resets_at": reset_time.strftime("%H:%M:%S")
        }
