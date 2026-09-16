const KO_FI_URL = 'https://ko-fi.com/mkr041107'

export function DonationFooter() {
  return (
    <footer className="donation-footer">
      <p>
        Built with AI coding tools — if you enjoy this project and want to help cover those costs,{' '}
        <a href={KO_FI_URL} target="_blank" rel="noopener noreferrer">
          a small tip on Ko-fi
        </a>{' '}
        is appreciated. No pressure at all.
      </p>
    </footer>
  )
}
