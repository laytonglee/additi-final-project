export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 700 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="4"
            floodColor="#90a4ae"
            floodOpacity="0.15"
          />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="350" cy="360" r="220" fill="#eef2f7" />

      {/* === Plant === */}
      <path d="M128 558 L118 610 L158 610 L148 558Z" fill="#90a4ae" />
      <rect x="112" y="548" width="52" height="14" rx="5" fill="#78909c" />
      <path
        d="M138 548 C138 520 122 500 118 482"
        stroke="#43a047"
        strokeWidth="3.5"
        fill="none"
      />
      <path
        d="M138 548 C138 512 154 492 158 474"
        stroke="#43a047"
        strokeWidth="3.5"
        fill="none"
      />
      <path
        d="M138 538 C130 518 136 498 132 478"
        stroke="#66bb6a"
        strokeWidth="3"
        fill="none"
      />
      <ellipse
        cx="110"
        cy="478"
        rx="24"
        ry="14"
        transform="rotate(-35 110 478)"
        fill="#66bb6a"
      />
      <ellipse
        cx="164"
        cy="470"
        rx="24"
        ry="14"
        transform="rotate(30 164 470)"
        fill="#43a047"
      />
      <ellipse
        cx="124"
        cy="450"
        rx="20"
        ry="12"
        transform="rotate(-20 124 450)"
        fill="#81c784"
      />
      <ellipse
        cx="152"
        cy="440"
        rx="20"
        ry="12"
        transform="rotate(22 152 440)"
        fill="#66bb6a"
      />
      <ellipse
        cx="134"
        cy="420"
        rx="18"
        ry="10"
        transform="rotate(-8 134 420)"
        fill="#4caf50"
      />

      {/* === Chair === */}
      <rect x="240" y="370" width="72" height="130" rx="14" fill="#cfd8dc" />
      <rect x="248" y="378" width="56" height="114" rx="10" fill="#e0e5ea" />
      <rect x="228" y="492" width="100" height="16" rx="6" fill="#b0bec5" />
      <line
        x1="248"
        y1="508"
        x2="242"
        y2="598"
        stroke="#90a4ae"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="318"
        y1="508"
        x2="324"
        y2="598"
        stroke="#90a4ae"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* === Desk === */}
      <rect x="296" y="480" width="300" height="12" rx="4" fill="#dce2e8" />
      <rect x="316" y="492" width="7" height="118" rx="3" fill="#b0bec5" />
      <rect x="566" y="492" width="7" height="118" rx="3" fill="#b0bec5" />
      <line
        x1="320"
        y1="554"
        x2="570"
        y2="554"
        stroke="#cfd8dc"
        strokeWidth="3"
      />

      {/* === Person === */}

      {/* ── Head ── */}
      {/* Base head shape - slightly wider than tall for friendly look */}
      <ellipse cx="318" cy="304" rx="38" ry="40" fill="#ffcc80" />

      {/* Ear (left side, partially hidden) */}
      <ellipse cx="280" cy="308" rx="7" ry="11" fill="#f5b963" />
      <ellipse cx="281" cy="308" rx="4" ry="7" fill="#eda74e" />

      {/* Hair - dark swept side fringe */}
      <path
        d="M280 290 C280 262 296 250 318 248 C344 246 358 260 358 284
           C358 274 348 264 332 262 L334 282
           C334 282 328 294 316 294
           C302 294 286 292 280 298Z"
        fill="#263238"
      />
      {/* Hair highlight */}
      <path
        d="M312 254 C320 252 332 256 338 264"
        stroke="#37474f"
        strokeWidth="3"
        fill="none"
        opacity="0.4"
      />

      {/* Eyes - simple confident dots with white highlight */}
      <circle cx="304" cy="306" r="3.5" fill="#263238" />
      <circle cx="305" cy="304.5" r="1" fill="white" />

      {/* Subtle cheek blush */}
      <ellipse cx="296" cy="316" rx="8" ry="4" fill="#ffb74d" opacity="0.3" />

      {/* Nose - minimal, just a subtle curve */}
      <path
        d="M310 308 C312 314 310 317 307 317"
        stroke="#e6a54a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth - friendly closed smile */}
      <path
        d="M300 322 C306 328 314 328 318 324"
        stroke="#e65100"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Neck */}
      <rect x="306" y="340" width="24" height="12" rx="6" fill="#ffcc80" />

      {/* ── Body ── */}
      {/* Hoodie torso */}
      <path
        d="M272 356 C272 348 292 340 318 340 C344 340 362 348 362 356 L370 480 L264 480Z"
        fill="#2979ff"
      />
      {/* Hood collar */}
      <path
        d="M284 356 C284 348 298 342 318 342 C338 342 350 348 352 356 L348 366 C344 358 334 352 318 352 C302 352 290 358 288 366Z"
        fill="#1565c0"
      />
      {/* Hoodie pocket */}
      <path
        d="M294 424 L342 424 C346 424 348 428 346 432 L340 452 L290 452 L286 432 C284 428 288 424 294 424Z"
        fill="#1565c0"
        opacity="0.45"
      />
      {/* Hoodie strings */}
      <line
        x1="310"
        y1="356"
        x2="306"
        y2="382"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="326"
        y1="356"
        x2="330"
        y2="382"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="306" cy="383" r="2" fill="white" />
      <circle cx="330" cy="383" r="2" fill="white" />

      {/* Left arm (toward laptop) */}
      <path
        d="M362 376 C378 392 396 406 414 420"
        stroke="#2979ff"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M362 376 C378 392 396 406 414 420"
        stroke="#1565c0"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="418" cy="424" rx="11" ry="10" fill="#ffcc80" />

      {/* Right arm (relaxed down) */}
      <path
        d="M272 376 C258 394 250 416 248 446"
        stroke="#2979ff"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M272 376 C258 394 250 416 248 446"
        stroke="#1565c0"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="246" cy="450" rx="11" ry="10" fill="#ffcc80" />

      {/* ── Legs ── */}
      <path d="M284 468 L276 546 L300 548 L306 478Z" fill="#f9a825" />
      <path d="M332 468 L340 546 L316 548 L310 478Z" fill="#f9a825" />
      <path d="M276 546 L270 594 L298 594 L300 548Z" fill="#f9a825" />
      <path d="M340 546 L346 594 L318 594 L316 548Z" fill="#f9a825" />

      {/* Shoes */}
      <path d="M266 590 L268 600 L302 600 L300 590Z" fill="#eceff1" />
      <path d="M314 590 L316 600 L350 600 L348 590Z" fill="#eceff1" />
      <path d="M266 600 L264 606 L304 606 L302 600Z" fill="#b0bec5" />
      <path d="M314 600 L312 606 L352 606 L350 600Z" fill="#b0bec5" />

      {/* === Laptop === */}
      <path d="M388 394 L524 394 L532 472 L378 472Z" fill="#455a64" />
      <path d="M396 402 L516 402 L522 464 L388 464Z" fill="#546e7a" />
      <path
        d="M396 402 L424 402 L418 464 L388 464Z"
        fill="#607d8b"
        opacity="0.25"
      />
      <path d="M368 472 L544 472 L550 484 L362 484Z" fill="#546e7a" />
      <rect x="440" y="474" width="30" height="5" rx="2" fill="#607d8b" />

      {/* === Coffee mug === */}
      <rect x="548" y="450" width="30" height="28" rx="5" fill="#78909c" />
      <rect x="552" y="454" width="22" height="20" rx="3" fill="#90a4ae" />
      <path
        d="M578 456 C588 456 590 466 582 472 L578 472"
        stroke="#78909c"
        strokeWidth="3.5"
        fill="none"
      />
      <path
        d="M558 444 C560 436 564 440 562 432"
        stroke="#b0bec5"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M566 446 C568 438 572 442 570 434"
        stroke="#b0bec5"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* === Floating UI elements === */}

      {/* Chat bubble - left */}
      <g>
        <rect
          x="224"
          y="214"
          width="56"
          height="38"
          rx="10"
          fill="white"
          filter="url(#shadow)"
        />
        <rect x="238" y="226" width="28" height="4" rx="2" fill="#90a4ae" />
        <rect x="238" y="236" width="20" height="4" rx="2" fill="#cfd8dc" />
        <path d="M246 252 L254 252 L248 262Z" fill="white" />
      </g>

      {/* Chat bubble - right */}
      <g>
        <rect
          x="490"
          y="246"
          width="58"
          height="40"
          rx="10"
          fill="white"
          filter="url(#shadow)"
        />
        <rect x="504" y="258" width="30" height="4" rx="2" fill="#90a4ae" />
        <rect x="504" y="268" width="22" height="4" rx="2" fill="#cfd8dc" />
        <path d="M530 286 L538 286 L534 296Z" fill="white" />
      </g>

      {/* Checkmark icon */}
      <g>
        <rect
          x="182"
          y="282"
          width="36"
          height="36"
          rx="10"
          fill="white"
          filter="url(#shadow)"
        />
        <path
          d="M192 300 L198 306 L210 292"
          stroke="#4caf50"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Shield/gem icon - top center */}
      <g>
        <circle cx="372" cy="190" r="16" fill="white" filter="url(#shadow)" />
        <path
          d="M366 188 L372 182 L378 188 L378 196 C378 198 372 200 372 200 C372 200 366 198 366 196Z"
          stroke="#42a5f5"
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      </g>

      {/* Lightbulb icon */}
      <g>
        <circle cx="440" cy="198" r="18" fill="white" filter="url(#shadow)" />
        <path
          d="M435 194 C435 188 438 184 440 184 C442 184 445 188 445 194 C445 197 444 199 443 200 L437 200 C436 199 435 197 435 194Z"
          stroke="#ffc107"
          strokeWidth="2"
          fill="none"
        />
        <line
          x1="437"
          y1="202"
          x2="443"
          y2="202"
          stroke="#ffc107"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="438"
          y1="205"
          x2="442"
          y2="205"
          stroke="#ffc107"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Floor shadow */}
      <ellipse cx="350" cy="618" rx="230" ry="8" fill="#e4e9ee" />
    </svg>
  );
}
