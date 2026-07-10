# Demo video script (60–90 seconds)

A shot list for recording the Loom walkthrough referenced in `SUBMISSION/README.md`. Record at
1600×1000 or larger so text is legible; use the seeded `demo@deskly.app` account so the data
looks lived-in rather than empty.

| Time | Screen | Say / do |
| --- | --- | --- |
| 0:00–0:08 | Landing page (`/`) | "This is Deskly — a helpdesk built for small support teams." Scroll past the hero screenshot. |
| 0:08–0:20 | Login → Dashboard | Sign in as `demo@deskly.app`. "Real auth, real data — this dashboard's KPIs and charts are computed from the seeded tickets, not hardcoded." Point at the resolution-rate KPI and the volume chart. |
| 0:20–0:32 | Tickets list | Navigate to Tickets. Type into search, pick a status filter. "Search, filter, sort, and pagination are all server-side — every combination is a shareable URL." Point at the URL bar changing. |
| 0:32–0:44 | Ticket detail | Click into a ticket. Change its status via the dropdown. "Every change — status, priority, assignment — is recorded on this timeline and in the org-wide audit log." Scroll to show a comment. |
| 0:44–0:52 | Command palette | Press ⌘K, type a ticket subject, jump to it. "Fully keyboard-driven — this is a live server search, not a client-side filter." |
| 0:52–1:05 | Settings → Members | Show the member list and the role dropdown. "Role-based access is enforced on the server, not just hidden in the UI — a Viewer literally can't reach this page, even by typing the URL directly." |
| 1:05–1:15 | Dark mode + CSV export | Toggle dark mode. Export the ticket list to CSV, show the downloaded file. "Properly designed dark mode, and every export respects whatever's currently filtered." |
| 1:15–1:20 | Landing page footer / GitHub | "It's open source, MIT licensed — link's in the description." |

## Recording checklist

- [ ] Fresh seed (`npm run db:seed`) so the data looks intentional, not messy from prior testing
- [ ] Browser zoom at 100%, no dev tools open, no bookmarks bar
- [ ] Close any notification/toast from a previous action before starting a new segment
- [ ] Export to a real `.mp4`/Loom link before pasting it into `SUBMISSION/README.md`
