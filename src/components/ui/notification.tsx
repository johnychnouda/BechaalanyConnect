import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

interface NotificationProps {
  count?: number;
  onClick?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ count = 0, onClick }) => {
  const router = useRouter();
  const handleClick = () => {
    if (onClick) onClick();
    router.push('/account-dashboard/notifications');
  };
  return (
    <StyledWrapper>
      <div className="notification" onClick={handleClick} tabIndex={0} role="button" aria-label="Notifications">
        <div className={`bell-container${count > 0 ? ' shake-infinite' : ''}`}>
          <div className="bell" />
        </div>
        {count > 0 && <span className="notification-badge">{count > 99 ? '99+' : count}</span>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .bell {
    border: 2.17px solid red;
    border-radius: 10px 10px 0 0;
    width: 15px;
    height: 17px;
    background: transparent;
    display: block;
    position: relative;
    top: -3px;
    transition: border-color 0.2s, background 0.2s;
  }
  .bell::before,
  .bell::after {
    content: "";
    background: red;
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: 2.17px;
    transition: background 0.2s;
  }
  .bell::before {
    top: 100%;
    width: 20px;
  }
  .bell::after {
    top: calc(100% + 4px);
    width: 7px;
  }
  .notification {
    background: transparent;
    border: none;
    padding: 15px 15px;
    border-radius: 50px;
    cursor: pointer;
    transition: 300ms;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .notification-badge {
    color: white;
    font-size: 10px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: red;
    position: absolute;
    right: 8px;
    top: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-weight: bold;
  }
  .notification:hover {
    background: #e73828;
  }
  .notification:hover .bell {
    border-color: #fff;
  }
  .notification:hover .bell::before,
  .notification:hover .bell::after {
    background: #fff;
  }
  .notification:hover > .bell-container {
    animation: bell-animation 650ms ease-out 0s 1 normal both;
  }
  .shake-infinite {
    animation: bell-animation 0.7s ease-in-out 0s infinite both;
  }
  @keyframes bell-animation {
    20% {
      transform: rotate(15deg);
    }
    40% {
      transform: rotate(-15deg);
      scale: 1.1;
    }
    60% {
      transform: rotate(10deg);
      scale: 1.1;
    }
    80% {
      transform: rotate(-10deg);
    }
    0%,
    100% {
      transform: rotate(0deg);
    }
  }
`;

export default Notification; 