import { ClipboardList } from "lucide-react";
import { motion } from "motion/react";

export function Performance() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Performance
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track your quiz and mock test results.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
          className="bg-card rounded-lg border border-border shadow-card flex flex-col items-center justify-center py-20 px-6 text-center"
          data-ocid="performance.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No tests attempted yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Complete a Mock Test or CA Quiz to see your performance here.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
