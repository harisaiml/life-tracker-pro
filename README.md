# Life Tracker Pro

A comprehensive life tracking application to manage your tasks, habits, diet, and goals.

## Features

- **Task Management**: Create, complete, and track tasks with priorities and categories
- **Habit Tracking**: Build daily habits with custom emojis and colors
- **Diet Logging**: Track meals with calories, protein, carbs, fat, and water intake
- **Goal Setting**: Set long-term goals with progress tracking and deadlines
- **Dashboard**: Real-time overview of your daily progress

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Storage**: LocalStorage (browser-based persistence)
- **Icons**: Font Awesome 6

## Getting Started

### Option 1: Direct Usage (Recommended)
Simply open `index.html` in your browser. All data is stored in your browser's LocalStorage.

### Option 2: Local Development
```bash
# No build required - just open index.html
```

## Project Structure

```
life-tracker-pro/
├── index.html          # Main application (single file)
├── dist/               # Production build
├── package.json        # Dependencies (for future enhancements)
└── README.md          # Documentation
```

## Features

### Login System
- Email/password authentication
- Guest mode for quick testing
- Session persistence via LocalStorage

### Dashboard
- Daily statistics overview
- Quick navigation to all features
- Today's tasks and habits preview

### Tasks
- Create tasks with title, description, priority, category, and due date
- Mark tasks as complete/incomplete
- Filter by active/completed
- Delete tasks

### Habits
- Create habits with custom emoji and color
- Daily check-in system
- Visual progress tracking
- Streak calculation

### Diet
- Log meals by type (breakfast, lunch, dinner, snack)
- Track calories, protein, carbs, fat
- Water intake tracking
- Daily nutrition summary

### Goals
- Set target values with units
- Track progress with visual progress bars
- Deadline management
- Completion status

## Data Storage

All data is stored locally in your browser using LocalStorage:
- `ltp_user` - User session
- `ltp_tasks` - Task list
- `ltp_habits` - Habit list
- `ltp_habit_logs` - Habit check-ins
- `ltp_diet` - Diet entries
- `ltp_goals` - Goals and progress

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License
