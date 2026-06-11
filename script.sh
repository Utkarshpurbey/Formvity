#!/bin/bash

# Arrays of sample data for variation
first_names=("Alice" "Bob" "Charlie" "Diana" "Eve" "Frank" "Grace" "Henry" "Iris" "Jack" "Karen" "Leo" "Mia" "Nathan" "Olivia" "Paul" "Quinn" "Rachel" "Sam" "Tina" "Uma" "Victor" "Wendy" "Xander" "Yara" "Zoe" "Amit" "Priya" "Rahul" "Sneha" "Arjun" "Kavya" "Rohit" "Ananya" "Vikram" "Pooja" "Suresh" "Divya" "Kiran" "Meera")
last_names=("Smith" "Johnson" "Williams" "Brown" "Jones" "Garcia" "Miller" "Davis" "Wilson" "Moore" "Taylor" "Anderson" "Thomas" "Jackson" "White" "Harris" "Martin" "Thompson" "Young" "King" "Sharma" "Verma" "Patel" "Gupta" "Kumar" "Singh" "Mehta" "Joshi" "Nair" "Iyer")
email_domains=("gmail.com" "yahoo.com" "hotmail.com" "outlook.com" "example.com" "test.com" "mail.com")
ticket_types=("VIP" "General" "Early Bird" "Student" "Corporate" "Premium" "Standard")
organizations=("Zinier" "Google" "Microsoft" "Infosys" "TCS" "Wipro" "Accenture" "Amazon" "Flipkart" "Swiggy" "Zomato" "Razorpay" "CRED" "Meesho" "PhonePe" "Freshworks" "Zoho" "Juspay" "Chargebee" "Clevertap")
special_reqs=("Vegetarian meal preferred" "Wheelchair access needed" "No special requirements" "Lactose intolerant" "Front row seating preferred" "Need interpreter" "Early entry requested" "Parking pass required" "Plus one attending" "Recording permission needed" "Halal food only" "Gluten free diet" "Child seat needed" "Sign language support" "None")
device_types=("desktop" "mobile" "tablet")
ages=("18" "19" "20" "21" "22" "23" "24" "25" "26" "27" "28" "29" "30" "31" "32" "33" "34" "35" "36" "37" "38" "39" "40")
phone_prefixes=("6" "7" "8" "9")

success=0
fail=0

for i in $(seq 1 100); do
  fname=${first_names[$((RANDOM % ${#first_names[@]}))]}
  lname=${last_names[$((RANDOM % ${#last_names[@]}))]}
  full_name="$fname $lname"
  email_domain=${email_domains[$((RANDOM % ${#email_domains[@]}))]}
  email="$(echo "${fname}.${lname}${RANDOM}@${email_domain}" | tr '[:upper:]' '[:lower:]')"
  phone_prefix=${phone_prefixes[$((RANDOM % ${#phone_prefixes[@]}))]}
  phone="${phone_prefix}$(printf '%09d' $((RANDOM % 1000000000)))"
  ticket=${ticket_types[$((RANDOM % ${#ticket_types[@]}))]}
  org=${organizations[$((RANDOM % ${#organizations[@]}))]}
  special_req=${special_reqs[$((RANDOM % ${#special_reqs[@]}))]}
  age=${ages[$((RANDOM % ${#ages[@]}))]}
  device=${device_types[$((RANDOM % ${#device_types[@]}))]}
  session_id=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "sess-$RANDOM-$RANDOM-$RANDOM")
  opened_ts="2026-06-11T07:$(printf '%02d' $((RANDOM % 60))):$(printf '%02d' $((RANDOM % 60))).000Z"
  submitted_ts="2026-06-11T07:$(printf '%02d' $((RANDOM % 60))):$(printf '%02d' $((RANDOM % 60))).000Z"
  time_ms=$((RANDOM % 60000 + 5000))
  screen_w=$((1200 + RANDOM % 600))
  screen_h=$((700 + RANDOM % 400))

  payload=$(cat <<PAYLOAD
{"answers":{"attendeeName":{"title":"Attendee Name","value":"${full_name}"},"attendeeEmail":{"title":"Attendee Email","value":"${email}"},"attendeePhone":{"title":"Attendee Phone","value":"${phone}"},"ticketType":{"title":"Ticket Type","value":"${ticket}"},"organization":{"title":"Organization / Company","value":"${org}"},"specialRequirements":{"title":"Special Requirements","value":"${special_req}"}},"respondent":{"fullName":"${full_name}","email":"${email}","age":"${age}"},"metadata":{"sessionId":"${session_id}","referrer":null,"utm":{"source":null,"medium":null,"campaign":null,"content":null,"term":null},"locale":"en-IN","timezone":"Asia/Calcutta","deviceType":"${device}","screen":{"width":${screen_w},"height":${screen_h}},"timing":{"formOpenedAt":"${opened_ts}","submittedAt":"${submitted_ts}","timeToCompleteMs":${time_ms}},"journey":{"pageCount":1,"visitedPageIds":["page-1"]},"client":{"appVersion":"0.0.0","sdk":"formvity-web"}}}
PAYLOAD
)

  response=$(curl -s -w "\n%{http_code}" \
    'http://localhost:8081/api/v1/public/forms/uttu-form-1-j7jvKwqSqQ/submit' \
    -H 'Accept: application/json' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJiOWY1NmVmZC00YmM0LTQwODgtODEyMS1mYTJiNWQ2NTdiMDYiLCJkaXNwbGF5TmFtZSI6InV0dHUiLCJpYXQiOjE3ODExMTQ1MjMsImV4cCI6MTc4MTIwMDkyM30.jqMW9hVRSDXsmwCvLIsHgPyfVErHcDvjkKtXDi2peEBkRCL4Bm_UvAb61F-M9Eaf' \
    -H 'Content-Type: application/json' \
    -H 'Origin: http://localhost:3000' \
    -H 'Referer: http://localhost:3000/' \
    --data-raw "${payload}")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
    ((success++))
    echo "[$i/100] ✅ $http_code | $full_name | $ticket | $org"
  else
    ((fail++))
    echo "[$i/100] ❌ $http_code | $full_name | $ticket | $org | $body"
  fi
done

echo ""
echo "==============================="
echo "✅ Successful: $success"
echo "❌ Failed:     $fail"
echo "==============================="