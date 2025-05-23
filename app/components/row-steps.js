"use client";

import React from "react";
import {useControlledState} from "@react-stately/utils";
import {m, LazyMotion, domAnimation} from "framer-motion";
import {cn} from "@nextui-org/react";
import {useRouter, usePathname} from "next/navigation";

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <m.path
        animate={{pathLength: 1}}
        d="M5 13l4 4L19 7"
        initial={{pathLength: 0}}
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
      />
    </svg>
  );
}

const RowSteps = React.forwardRef(
  (
    {
      color = "primary",
      steps = [],
      defaultStep = 0,
      onStepChange,
      currentStep: currentStepProp,
      hideProgressBars = false,
      stepClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const [currentStep, setCurrentStep] = useControlledState(
      currentStepProp,
      defaultStep,
      onStepChange,
    );

    const router = useRouter();
    const pathname = usePathname();
    const stepPaths = ['/select', '/category', '/upload', '/guide'];

    React.useEffect(() => {
      const pathIndex = stepPaths.indexOf(pathname);
      if (pathIndex !== -1 && pathIndex !== currentStep) {
        setCurrentStep(pathIndex);
      }
    }, [pathname, stepPaths, setCurrentStep]);

    const colors = React.useMemo(() => {
      let userColor;
      let fgColor;

      const colorsVars = [
        "[--active-fg-color:white]",
        "[--active-border-color:#F25B2B]",
        "[--active-color:#F25B2B]",
        "[--complete-background-color:#F25B2B]",
        "[--complete-border-color:#F25B2B]",
        "[--inactive-border-color:#A1A1AA]",
        "[--inactive-color:#A1A1AA]",
      ];

      switch (color) {
        case "primary":
          userColor = "[--step-color:hsl(var(--nextui-primary))]";
          fgColor = "[--step-fg-color:hsl(var(--nextui-primary-foreground))]";
          break;
        case "secondary":
          userColor = "[--step-color:hsl(var(--nextui-secondary))]";
          fgColor = "[--step-fg-color:hsl(var(--nextui-secondary-foreground))]";
          break;
        case "success":
          userColor = "[--step-color:hsl(var(--nextui-success))]";
          fgColor = "[--step-fg-color:hsl(var(--nextui-success-foreground))]";
          break;
        case "warning":
          userColor = "[--step-color:hsl(var(--nextui-warning))]";
          fgColor = "[--step-fg-color:hsl(var(--nextui-warning-foreground))]";
          break;
        case "danger":
          userColor = "[--step-color:hsl(var(--nextui-error))]";
          fgColor = "[--step-fg-color:hsl(var(--nextui-error-foreground))]";
          break;
        case "default":
          userColor = "[--step-color:hsl(var(--nextui-default))]";
          fgColor = "[--step-fg-color:hsl(var(--nextui-default-foreground))]";
          break;
        default:
          userColor = "[--step-color:hsl(var(--nextui-primary))]";
          fgColor = "[--step-fg-color:hsl(var(--nextui-primary-foreground))]";
          break;
      }

      if (!className?.includes("--step-fg-color")) colorsVars.unshift(fgColor);
      if (!className?.includes("--step-color")) colorsVars.unshift(userColor);
      if (!className?.includes("--inactive-bar-color"))
        colorsVars.push("[--inactive-bar-color:hsl(var(--nextui-default-300))]");

      return colorsVars;
    }, [color, className]);

    return (
      <nav aria-label="Progress" className="-my-4 max-w-fit py-4">
        <ol className={cn("flex flex-row  gap-x-3", colors, className)}>
          {steps?.map((step, stepIdx) => {
            let status =
              currentStep === stepIdx ? "active" : currentStep < stepIdx ? "inactive" : "complete";

            return (
              <li key={stepIdx} className="relative flex w-full items-center pr-12">
                <button
                  key={stepIdx}
                  ref={ref}
                  aria-current={status === "active" ? "step" : undefined}
                  className={cn(
                    "group flex w-full cursor-pointer flex-row items-center justify-center gap-x-3 rounded-large py-2.5",
                    stepClassName,
                  )}
                  onClick={() => {
                    setCurrentStep(stepIdx);
                    router.push(stepPaths[stepIdx]);
                  }}
                  {...props}
                >
                  <div className="h-full relative flex items-center">
                    <LazyMotion features={domAnimation}>
                      <m.div animate={status} className="relative">
                        <m.div
                          className={cn(
                            "relative flex h-8 w-8 items-center justify-center rounded-full border-medium text-large font-semibold text-default-foreground",
                            {
                              "shadow-lg": status === "complete",
                            },
                          )}
                          initial={false}
                          transition={{duration: 0.25}}
                          variants={{
                            inactive: {
                              backgroundColor: "transparent",
                              borderColor: "var(--inactive-border-color)",
                              color: "var(--inactive-color)",
                            },
                            active: {
                              backgroundColor: "transparent",
                              borderColor: "var(--active-border-color)",
                              color: "var(--active-color)",
                            },
                            complete: {
                              backgroundColor: "var(--complete-background-color)",
                              borderColor: "var(--complete-border-color)",
                            },
                          }}
                        >
                          <div className="flex items-center justify-center">
                            {status === "complete" ? (
                              <CheckIcon className="h-6 w-6 text-[var(--active-fg-color)]" />
                            ) : (
                              <span>{stepIdx + 1}</span>
                            )}
                          </div>
                        </m.div>
                      </m.div>
                    </LazyMotion>
                  </div>
                  <div className="w-20 text-start">
                    <div
                      className={cn(
                        "text-small font-medium text-default-foreground transition-[color,opacity] duration-300 group-active:opacity-80 lg:text-small w-full",
                        {
                          "text-default-500": status === "inactive",
                        },
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                  {stepIdx < steps.length - 1 && !hideProgressBars && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 w-10 flex-none items-center"
                      style={{
                        // @ts-ignore
                        "--idx": stepIdx,
                      }}
                    >
                      <div
                        className={cn(
                          "relative h-0.5 w-full bg-[var(--inactive-bar-color)] transition-colors duration-300",
                          "after:absolute after:block after:h-full after:w-0 after:bg-[var(--active-border-color)] after:transition-[width] after:duration-300 after:content-['']",
                          {
                            "after:w-full": stepIdx < currentStep,
                          },
                        )}
                      />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

RowSteps.displayName = "RowSteps";

export default RowSteps;
